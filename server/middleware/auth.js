// /server/middleware/auth.js
import User from "../models/User.js";
import { getAuth, clerkClient } from "@clerk/express";

export const requireAuth = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    let user = await User.findOne({ clerkId: userId });

    if (!user) {
      // User not in DB – sync from Clerk
      const clerkUser = await clerkClient.users.getUser(userId);

      const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
      const name =
        `${clerkUser.firstName ?? ""} ${clerkUser.lastName ?? ""}`.trim() ||
        email ||
        "User";

      user = await User.create({
        clerkId: userId,
        email,
        name,
        role: "customer",
        isActive: true,
        lastLoginAt: new Date(),
      });
    } else {
      // Update last login time
      user.lastLoginAt = new Date();
      await user.save();
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Account is deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};