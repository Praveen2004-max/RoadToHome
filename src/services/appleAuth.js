
let appleScriptPromise;

export const loadAppleSDK = () => {
    if (window.AppleID?.auth) {
        return Promise.resolve();
    }

    if (appleScriptPromise) {
        return appleScriptPromise;
    }

    appleScriptPromise = new Promise((resolve, reject) => {
        const script = document.createElement("script");

        script.src =
            "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";

        script.async = true;

        script.onload = resolve;
        script.onerror = () => {
            appleScriptPromise = null;
            reject(new Error("Unable to load Apple authentication."));
        };

        document.head.appendChild(script);
    });

    return appleScriptPromise;
};

export const appleSignIn = async () => {
    await loadAppleSDK();

    const clientId = import.meta.env.VITE_APPLE_CLIENT_ID;
    const redirectURI = import.meta.env.VITE_APPLE_REDIRECT_URI;

    if (!clientId || !redirectURI) {
        throw new Error("Apple authentication is not configured.");
    }

    window.AppleID.auth.init({
        clientId,
        scope: "name email",
        redirectURI,
        usePopup: true,
    });

    const response = await window.AppleID.auth.signIn();

    const credential = response.authorization?.id_token;

    if (!credential) {
        throw new Error("Apple identity token was not received.");
    }

    const firstName = response.user?.name?.firstName || "";
    const lastName = response.user?.name?.lastName || "";

    return {
        credential,
        fullName: `${firstName} ${lastName}`.trim(),
    };
};
