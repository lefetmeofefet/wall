import {html, createYoffeeElement} from "../../libs/yoffee/yoffee.min.js"
import {GlobalState} from "../state.js";
import {Api} from "../api.js"
import "../components/text-input.js"
import "../components/x-button.js"
import "../components/x-icon.js"
import {getUrlParams, updateUrlParams} from "../../utilz/url-utilz.js";
import {showToast} from "../../utilz/toaster.js";


createYoffeeElement("login-page", (props, self) => {
    let state = {
        signupMode: false,
        nicknameMode: false,
        loadingUser: true
    }

    async function loadUser() {
        GlobalState.loading = true
        let user = await Api.getUser()
        if (user != null) {
            await continueWithUser(user)
        }
        GlobalState.loading = false
        state.loadingUser = false
    }
    // First attempt to load user with existing cookies
    loadUser()

    async function finishLogin(user) {
        GlobalState.user = user
        await new Promise(res => requestAnimationFrame(() => res())) // This is for loader to show up
        GlobalState.walls = await Api.getWalls()
    }

    let user

    async function continueWithUser(userInfo) {
        if (userInfo.nickname == null) {
            user = userInfo
            state.nicknameMode = true
        } else {
            finishLogin(userInfo)
        }
    }

    async function login() {
        let email = self.shadowRoot.querySelector("#email-input").value
        let password = self.shadowRoot.querySelector("#password-input").value
        if (email.trim() === "" || password.trim() === "") {
            return
        }
        try {
            let user = await Api.login(email, password)
            await continueWithUser(user)
        } catch (e) {
            showToast(e.errorMessage || "Error loggin in", {error: true})
        }
    }

    async function signUp() {
        let email = self.shadowRoot.querySelector("#email-input").value
        let password = self.shadowRoot.querySelector("#password-input").value
        if (email.trim() === "" || password.trim() === "") {
            return
        }
        try{
            let user = await Api.signUp(email, password)
            await continueWithUser(user)
        } catch (e) {
            showToast(e.errorMessage || "Error signing up", {error: true})
        }
    }

    async function setNickname() {
        let nickname = self.shadowRoot.querySelector("#nickname-input").value
        if (nickname.trim() === "") {
            return
        }
        user.nickname = nickname
        await Api.setNickname(nickname)
        finishLogin(user)
    }

    self.onConnect = () => {
        window.onGoogleLibraryLoad = () => {
            google.accounts.id.initialize({
                client_id: '798008696513-9jhivsjbs7j8pacr6d8dfps9qh25tbbp.apps.googleusercontent.com',
                callback: async loginInfo => {
                    try {
                        let user = await Api.googleAuth(loginInfo.credential)
                        console.log("Login info: ", loginInfo)
                        await continueWithUser(user)
                    } catch(e) {
                        showToast(e.errorMessage || "Error signing in with google", {error: true})
                    }
                }
            })
            google.accounts.id.renderButton(
                self.shadowRoot.querySelector("#google-signin-button"),
                {
                    type: "standard",
                    shape: "pill",
                    theme: "filled_blue",
                    text: "signin",
                    size: "large",
                    logo_alignment: "left"
                }
            )
        }
    }

    return html(GlobalState, state)`
<link href="../../style/scrollbar-style.css" rel="stylesheet">
<style>
    :host {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
        gap: 12px;
        color: var(--text-color);
    }
    
    #welcome {
        margin-top: auto;
        font-size: 47px;
        line-height: 40px;
    }
    
    #to {
        font-size: 20px;
        line-height: 15px;
    }
    
    #flashboard {
        line-height: 28px;
        font-size: 37px;
        margin-bottom: 16px;
    }
    
    #choose {
        font-size: 57px;
        line-height: 43px;
    }
    
    #your {
        font-size: 20px;
        line-height: 15px;
    }
    
    #nickname {
        font-size: 46px;
        line-height: 33px;
        margin-bottom: 20px;
    }
    
    text-input {
        border-radius: 100px;
        background-color: var(--background-color-3);
        max-width: 192px;
        min-width: 192px;
        font-size: 16px;
        --placeholder-color: var(--text-color-weak-1);
    }
    
    #login-button, #continue-button {
        min-width: 232px;
        padding: 9px 0;
        background-color: var(--secondary-color);
        border-radius: 100px;
        color: var(--text-color-on-secondary);
    }
    
    #or-sign-in-using {
        opacity: 0.4;
    }
    
    #google-signin-button {
        max-width: 253px;
    }
    
    #signup {
        margin-top: auto;
        margin-bottom: auto;
        font-size: 16px;
        opacity: 0.6;
        display: flex;
        gap: 3px;
    }
    
    #signup > x-button {
        padding: 0 5px;
        background-color: transparent;
        box-shadow: none;
        text-decoration: underline;
        color: var(--text-color);
    }
    
</style>

${() => GlobalState.loading ? html()`
<style>
    /* Loader */
    :host::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        height: 2px;
        width: 0;
        background-color: var(--secondary-color);
        animation: loading 2s infinite;
    }
    
    @keyframes loading {
        0% { width: 0; margin-left: 0; }
        50% { width: 100%; margin-left: 0; }
        100% { width: 0; margin-left: 100%; }
    }
</style>
` : ""}

${() => state.loadingUser ? html()`
<style>
    * {
        display: none !important;
    }
</style>
` : ""}
${() => state.nicknameMode ?
        html()`
<div id="choose">CHOOSE</div>
<div id="your">YOUR</div>
<div id="nickname">NICKNAME</div>
<text-input id="nickname-input"
            placeholder="Nickname"></text-input>
<x-button id="continue-button"
          onclick=${() => setNickname()}>
    CONTINUE
</x-button>
` :
        html()`
<div id="welcome">WELCOME</div>
<div id="to">TO</div>
<div id="flashboard">FLASHBOARD</div>
<text-input id="email-input"
            placeholder="Email"
            type="email"></text-input>
<text-input id="password-input"
            placeholder="Password"
            type="password"></text-input>
<x-button id="login-button"
          onclick=${() => state.signupMode ? signUp() : login()}>
    ${() => state.signupMode ? "SIGN UP" : "LOGIN"}
</x-button>
<div id="or-sign-in-using">Or ${() => state.signupMode ? "sign up" : "sign in"} with</div>
<div id="google-signin-button"></div>
<div id="signup">
    ${() => state.signupMode ? "Have an account already?" : "No account yet?"} 
    <x-button onclick=${() => state.signupMode = !state.signupMode}>
        ${() => state.signupMode ? "Login" : "Sign Up"}
    </x-button>
</div>
`
    }
`
});
