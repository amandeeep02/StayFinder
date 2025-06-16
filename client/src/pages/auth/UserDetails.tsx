import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { api } from "../../utils/api";

interface UserDetailsForm {
    firstName: string;
    lastName: string;
    email: string;
    role: "user" | "host";
}

interface HostProfileForm {
    languages: string[];
    checkInTime: string;
    checkOutTime: string;
    minimumStay: number;
    maximumStay: number;
    cancellationPolicy: "flexible" | "moderate" | "strict" | "super_strict";
    responseTime: "within_hour" | "within_few_hours" | "within_day" | "few_days";
    hostingStyle: string;
    houseRules: string[];
    instantBooking: boolean;
    yearsOfExperience: number;
}

export const UserDetails: React.FC = () => {
    const { currentUser, authUser } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [showHostForm, setShowHostForm] = useState(false);
    const [houseRule, setHouseRule] = useState("");

    const [userForm, setUserForm] = useState<UserDetailsForm>({
        firstName: "",
        lastName: "",
        email: "",
        role: "user",
    });

    const [hostForm, setHostForm] = useState<HostProfileForm>({
        languages: ["English", "Hindi"],
        checkInTime: "12:00",
        checkOutTime: "11:00",
        minimumStay: 1,
        maximumStay: 30,
        cancellationPolicy: "moderate",
        responseTime: "within_day",
        hostingStyle: "",
        houseRules: [],
        instantBooking: false,
        yearsOfExperience: 0,
    });

    useEffect(() => {
        if (currentUser) {
            setUserForm({
                firstName: authUser?.firstName || currentUser.displayName?.split(" ")[0] || "",
                lastName: authUser?.lastName || currentUser.displayName?.split(" ")[1] || "",
                email: authUser?.email || currentUser.email || "",
                role: authUser?.role || "user",
            });
        }
    }, [currentUser, authUser]);

    const handleUserFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserForm(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "role") {
            setShowHostForm(value === "host");
        }
    };

    const handleHostFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setHostForm(prev => ({
                ...prev,
                [name]: checked
            }));
        } else if (name === "languages") {
            const languages = value.split(",").map(lang => lang.trim());
            setHostForm(prev => ({
                ...prev,
                languages
            }));
        } else {
            setHostForm(prev => ({
                ...prev,
                [name]: type === "number" ? parseInt(value) || 0 : value
            }));
        }
    };

    const addHouseRule = () => {
        if (houseRule.trim()) {
            setHostForm(prev => ({
                ...prev,
                houseRules: [...prev.houseRules, houseRule.trim()]
            }));
            setHouseRule("");
        }
    };

    const removeHouseRule = (index: number) => {
        setHostForm(prev => ({
            ...prev,
            houseRules: prev.houseRules.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update user details
            await api.post("/users/user", userForm);

            // If user chose to be a host, create host profile
            if (userForm.role === "host") {
                await api.post("/host/profile", hostForm);
                navigate("/host/dashboard");
            } else {
                navigate("/home");
            }
        } catch (error) {
            console.error("Error saving user details:", error);
            // Handle error - show toast/notification
            alert("Failed to save details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Complete Your Profile
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Please provide your details to get started
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {/* User Details Section */}
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    value={userForm.firstName}
                                    onChange={handleUserFormChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    value={userForm.lastName}
                                    onChange={handleUserFormChange}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={userForm.email}
                                onChange={handleUserFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                                I want to join as a
                            </label>
                            <select
                                id="role"
                                name="role"
                                value={userForm.role}
                                onChange={handleUserFormChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="user">Guest</option>
                                <option value="host">Host</option>
                            </select>
                        </div>

                        {/* Host Profile Section */}
                        {showHostForm && (
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Host Profile Details</h3>
                                
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="yearsOfExperience" className="block text-sm font-medium text-gray-700">
                                                Years of Experience
                                            </label>
                                            <input
                                                id="yearsOfExperience"
                                                name="yearsOfExperience"
                                                type="number"
                                                min="0"
                                                max="50"
                                                value={hostForm.yearsOfExperience}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                                                Languages (comma separated)
                                            </label>
                                            <input
                                                id="languages"
                                                name="languages"
                                                type="text"
                                                value={hostForm.languages.join(", ")}
                                                onChange={handleHostFormChange}
                                                placeholder="English, Spanish, French"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="checkInTime" className="block text-sm font-medium text-gray-700">
                                                Check-in Time
                                            </label>
                                            <input
                                                id="checkInTime"
                                                name="checkInTime"
                                                type="time"
                                                required
                                                value={hostForm.checkInTime}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="checkOutTime" className="block text-sm font-medium text-gray-700">
                                                Check-out Time
                                            </label>
                                            <input
                                                id="checkOutTime"
                                                name="checkOutTime"
                                                type="time"
                                                required
                                                value={hostForm.checkOutTime}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="minimumStay" className="block text-sm font-medium text-gray-700">
                                                Minimum Stay (days)
                                            </label>
                                            <input
                                                id="minimumStay"
                                                name="minimumStay"
                                                type="number"
                                                min="1"
                                                max="365"
                                                required
                                                value={hostForm.minimumStay}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label htmlFor="maximumStay" className="block text-sm font-medium text-gray-700">
                                                Maximum Stay (days)
                                            </label>
                                            <input
                                                id="maximumStay"
                                                name="maximumStay"
                                                type="number"
                                                min="1"
                                                max="365"
                                                required
                                                value={hostForm.maximumStay}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                        <div>
                                            <label htmlFor="responseTime" className="block text-sm font-medium text-gray-700">
                                                Response Time
                                            </label>
                                            <select
                                                id="responseTime"
                                                name="responseTime"
                                                value={hostForm.responseTime}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="within_hour">Within an hour</option>
                                                <option value="within_few_hours">Within a few hours</option>
                                                <option value="within_day">Within a day</option>
                                                <option value="few_days">A few days</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label htmlFor="cancellationPolicy" className="block text-sm font-medium text-gray-700">
                                                Cancellation Policy
                                            </label>
                                            <select
                                                id="cancellationPolicy"
                                                name="cancellationPolicy"
                                                value={hostForm.cancellationPolicy}
                                                onChange={handleHostFormChange}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            >
                                                <option value="flexible">Flexible</option>
                                                <option value="moderate">Moderate</option>
                                                <option value="strict">Strict</option>
                                                <option value="super_strict">Super Strict</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="hostingStyle" className="block text-sm font-medium text-gray-700">
                                            Hosting Style
                                        </label>
                                        <textarea
                                            id="hostingStyle"
                                            name="hostingStyle"
                                            rows={4}
                                            value={hostForm.hostingStyle}
                                            onChange={handleHostFormChange}
                                            placeholder="Describe your hosting approach and what makes your place special..."
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            House Rules
                                        </label>
                                        <div className="flex gap-2 mb-2">
                                            <input
                                                type="text"
                                                value={houseRule}
                                                onChange={(e) => setHouseRule(e.target.value)}
                                                placeholder="Add a house rule"
                                                className="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={addHouseRule}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                Add
                                            </button>
                                        </div>
                                        {hostForm.houseRules.length > 0 && (
                                            <ul className="space-y-1">
                                                {hostForm.houseRules.map((rule, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded">
                                                        <span>{rule}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeHouseRule(index)}
                                                            className="text-red-600 hover:text-red-800"
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            id="instantBooking"
                                            name="instantBooking"
                                            type="checkbox"
                                            checked={hostForm.instantBooking}
                                            onChange={handleHostFormChange}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="instantBooking" className="ml-2 block text-sm text-gray-900">
                                            Enable instant booking
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : userForm.role === "host" ? "Create Host Profile" : "Complete Profile"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};