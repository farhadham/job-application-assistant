"use client";

import { Button } from "@heroui/button";
import { User } from "lucide-react";
import Link from "next/link";

export const Navbar = () => {
  return (
    <header className="py-4 flex items-center justify-between ">
      <Button as={Link} href="/" className="font-bold">
        Job helper
      </Button>
      <div className="flex items-center gap-2">
        <Button as={Link} href="/custom-post">
          Create your own posting
        </Button>
        <Button as={Link} href="/applied" variant="bordered">
          Applied jobs
        </Button>
        <Button
          as={Link}
          href="/profile"
          isIconOnly
          aria-label="profile page"
          color="primary"
        >
          <User size={20} />
        </Button>
      </div>
    </header>
  );
};
