'use server'

import { request } from "@arcjet/next";
import { protectionSignInRules, protectionSignUpRules } from "../arjects";

export const protectionSignUpActions = async (email: string) => {
  try {
    const req = await request();
    const decision = await protectionSignUpRules.protect(req, { email });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return {
            error: "Email is disposable",
            success: false,
            status: 400,
          };
        }
       else if (emailTypes.includes("INVALID")) {
          return {
            error: " email is invalid ",
            success: false,
            status: 400,
          };
        }
        else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: " email does not have a max record ",
            success: false,
            status: 400,
          };
        }
      } else if (decision.reason.isBot()) {
        return {
          error: "Bot detected",
          success: false,
          status: 400,
        };
      } else if (decision.reason.isRateLimit()) {
        return {
          error: "Too many requests in a short period of time",
          success: false,
          status: 400,
        };
      }
    }
    
    return {
      success: true,
      status: 200,
    };
  } catch (error) {
    return {
      error: "An unexpected error occurred",
      success: false,
      status: 500,
    };
  }
};

export const protectionSignInActions = async (email: string) => {
  try {
    const req = await request();
    const decision = await protectionSignInRules.protect(req, { email });

    if (decision.isDenied()) {
      if (decision.reason.isEmail()) {
        const emailTypes = decision.reason.emailTypes;
        if (emailTypes.includes("DISPOSABLE")) {
          return {
            error: "Email is disposable",
            success: false,
            status: 400,
          };
        }
       else if (emailTypes.includes("INVALID")) {
          return {
            error: " email is invalid ",
            success: false,
            status: 400,
          };
        }
        else if (emailTypes.includes("NO_MX_RECORDS")) {
          return {
            error: " email does not have a max record ",
            success: false,
            status: 400,
          };
        }
      }
    }
    
    return {
      success: true,
      status: 200,
    };
  } catch (error) {
    return {
      error: "An unexpected error occurred",
      success: false,
      status: 500,
    };
  }
};
