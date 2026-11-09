
import API from "./api";

export const socialAuthentication = async (
    provider,
    credential,
    fullName = ""
) => {
    const response = await API.post("/users/social-signIn", {
        provider,
        credential,
        fullName,
    });

    const { token, user } = response.data;

    if (!token || !user) {
        throw new Error("Invalid authentication response.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    // Update Navbar authentication state
    window.dispatchEvent(new Event("authChanged"));

    return { token, user };
};