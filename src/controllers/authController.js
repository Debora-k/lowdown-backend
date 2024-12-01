import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';
import nodemailer from 'nodemailer';

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY;
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const SENDER_EMAIL = process.env.EMAIL;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;

export const authenticate = (req, res, next) => {
  try {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
      throw new Error("Can't take token");
    }
    const token = tokenString.replace('Bearer ', '');
    jwt.verify(token, SECRET_KEY, (error, payload) => {
      if (error) {
        return res
          .status(401)
          .json({ status: 'fail', message: 'Invalid token' });
      }
      req.userId = payload._id;
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const loginWithEmail = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'No account found with these details',
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({
        status: 'fail',
        message: 'Incorrect password. Please try again',
      });
    }

    const token = await user.generateAuthToken();
    return res.status(200).json({ status: 'success', user, token });
  } catch (error) {
    next(error);
  }
};

export const loginWithGoogle = async (req, res, next) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        status: 'fail',
        message: 'No credential provided',
      });
    }

    const userInfo = await axios.get(
      'https://www.googleapis.com/oauth2/v3/userinfo',
      {
        headers: { Authorization: `Bearer ${credential}` },
      }
    );

    const { email, name, sub: googleId, picture } = userInfo.data;

    let user = await User.findOne({ $or: [{ email }, { googleId }] });

    if (!user) {
      user = new User({
        email,
        name,
        googleId,
        picture,
      });

      await user.save();
    } else {
      if (!user.googleId) {
        user.googleId = googleId;
      }

      if (!user.picture) {
        user.picture = picture;
      }
      await user.save();
    }

    const token = await user.generateAuthToken();
    res.status(200).json({ status: 'success', user, token });
  } catch (error) {
    console.error('Google Login Error:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User doesn't exist" });

    const secret = SECRET_KEY + user.password;
    const token = jwt.sign({ id: user._id, email: user.email }, secret, {
      expiresIn: '24h',
    });

    const forgotURL = `http://localhost:3000/resetPassword?id=${user._id}&token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SENDER_EMAIL,
        pass: EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      to: user.email,
      from: SENDER_EMAIL,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
      Please click on the following link, or paste this into your browser to complete the process:\n\n
      ${forgotURL}\n\n
      If you did not request this, please ignore this email and your password will remain unchanged.\n`,
    };
    await transporter.sendMail(mailOptions);
    res
      .status(200)
      .json({ status: 'success', message: 'Password reset link sent' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: 'failed', message: 'Something went wrong' });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const user = await User.findOne({ _id: id });
    if (!user) {
      return res.status(400).json({ message: 'User not exists!' });
    }
    const secret = SECRET_KEY + user.password;

    const verify = jwt.verify(token, secret);
    const encryptedPassword = await bcrypt.hash(password, 10);
    await User.updateOne(
      { _id: id },
      { $set: { password: encryptedPassword } }
    );
    await user.save();
    res
      .status(200)
      .json({ status: 'success', message: 'Password has been reset' });
  } catch (error) {
    res.status(500).json({ status: 'failed', message: 'Something went wrong' });
  }
};
