"use client";
import {
    Navbar,
    NavBody,
    NavItems,
    MobileNav,
    NavbarLogo,
    NavbarButton,
    MobileNavHeader,
    MobileNavToggle,
    MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModeToggle } from "../ModeToggle";


export function NewNavbar() {
    const navItems = [
        {
            name: "Home",
            link: "/home",
        },
        {
            name: "My Bookings",
            link: "/bookings",
        },
        {
            name: "Host Dashboard",
            link: "/host/dashboard",
        },
    ];
    const [error, setError] = useState("");
    const { currentUser, authUser, loginWithGoogle, logout } = useAuth();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleGoogleSignIn = async () => {
        try {
            await loginWithGoogle();
            // Redirect to home instead of user-details if user already exists
            navigate("/home");
        } catch (err) {
            setError("Failed to sign in with Google");
            console.error(err);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (err) {
            setError("Failed to log out");
            console.error(err);
        }
    };

    return (
        <div className="relative w-full">
            <Navbar>
                {/* Desktop Navigation */}
                <NavBody>
                    <NavbarLogo />
                    {/* Only show nav items if user is logged in */}
                    {currentUser && <NavItems items={navItems} />}
                    <div className="flex items-center gap-4">
                        {currentUser ? (
                            <div className="flex items-center gap-3">
                                <span className="font-medium text-neutral-800 dark:text-white">
                                    Hi{" "}
                                    {authUser?.firstName ||
                                        currentUser.displayName?.split(
                                            " "
                                        )[0] ||
                                        "User"}
                                    !
                                </span>
                                <NavbarButton
                                    variant="dark"
                                    className="px-4 py-2 font-medium"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </NavbarButton>
                            </div>
                        ) : (
                            <NavbarButton
                                variant="dark"
                                className="px-5 py-3 font-semibold shadow-lg"
                                onClick={handleGoogleSignIn}
                            >
                                Login
                            </NavbarButton>
                        )}
                        <NavbarButton variant="dark">
                            <ModeToggle />
                        </NavbarButton>
                    </div>
                </NavBody>

                {/* Mobile Navigation */}
                <MobileNav>
                    <MobileNavHeader>
                        <NavbarLogo />
                        <MobileNavToggle
                            isOpen={isMobileMenuOpen}
                            onClick={() =>
                                setIsMobileMenuOpen(!isMobileMenuOpen)
                            }
                        />
                    </MobileNavHeader>

                    <MobileNavMenu
                        isOpen={isMobileMenuOpen}
                        onClose={() => setIsMobileMenuOpen(false)}
                    >
                        {/* Only show nav items if user is logged in */}
                        {currentUser &&
                            navItems.map((item, idx) => (
                                <a
                                    key={`mobile-link-${idx}`}
                                    href={item.link}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="relative text-neutral-600 dark:text-neutral-300"
                                >
                                    <span className="block">{item.name}</span>
                                </a>
                            ))}
                        <div className="flex w-full flex-col gap-4">
                            {currentUser ? (
                                <>
                                    <div className="text-center text-neutral-800 dark:text-white font-medium mb-2">
                                        Hi{" "}
                                        {authUser?.firstName ||
                                            currentUser.displayName?.split(
                                                " "
                                            )[0] ||
                                            "User"}
                                        !
                                    </div>
                                    <NavbarButton
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                        variant="primary"
                                        className="w-full"
                                    >
                                        Logout
                                    </NavbarButton>
                                </>
                            ) : (
                                <NavbarButton
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        handleGoogleSignIn();
                                    }}
                                    variant="primary"
                                    className="w-full"
                                >
                                    Login
                                </NavbarButton>
                            )}
                        </div>
                    </MobileNavMenu>
                </MobileNav>
            </Navbar>
        </div>
    );
}
