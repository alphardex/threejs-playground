import { NavItem } from "@/types";

const activityID = "";
const publicKey = ``;
const useEncrypt = true;

const isDevMode = process.env.NODE_ENV === "development";

const BASEPATH = "main.php?mod=";

const API = {
  wxShare: "wxShareConfigParameters",
  info: "info",
};

Object.entries(API).forEach(([key, value]) => {
  (API as Record<string, string>)[key] = `${BASEPATH}${value}`;
});

const navItems: NavItem[] = [{ to: { name: "Home", query: { mod: "main" } }, text: "首页" }];

export { activityID, publicKey, useEncrypt, isDevMode, API, navItems };
