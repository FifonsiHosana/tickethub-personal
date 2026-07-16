import type { JSX } from "react";
import { FaXTwitter, FaFacebook, FaInstagram } from "react-icons/fa6";

type SocialLinks = {
  name: string;
  href: string;
  icon: JSX.Element;
};

export const socialLinks: SocialLinks[] = [
  { name: "X", href: "https://x.com", icon: <FaXTwitter /> },
  { name: "Facebook", href: "https://facebook.com", icon: <FaFacebook /> },
  { name: "Instagram", href: "https://instagram.com", icon: <FaInstagram /> },
];

type ContactData = {
  name: string;
  value: string;
  href?: string;
};

export const contactData: ContactData[] = [
  {
    name: "Email",
    value: "info@tickethubgh.com",
    href: "mailto:info@tickethubgh.com",
  },
  { name: "Phone", value: "+233 566 608 314", href: "tel:+233566608314" },
];
