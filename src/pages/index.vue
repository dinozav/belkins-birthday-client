<template>
  <main>
    <h1 v-if="isLoading">LOADING</h1>

    <div v-else>
      <h1 v-if="error">{{ error }}</h1>
      <div v-if="!user">
        <button @click.prevent="signInGoogle">Sign In via Google</button>
      </div>

      <div v-if="user && !metamask">
        <button v-if="isMetamaskInstalled" @click.prevent="signInMetamask">
          Sign In with Metamask
        </button>

        <a
          v-else
          href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
        >
          Install Metamask
        </a>
      </div>

      <div v-if="user && metamask">
        <div>{{ user.email }}</div>
        <div>{{ metamask }}</div>

        <br />

        <button v-if="!isRequestSent" @click.prevent="sendRequest">
          Redeem NFT
        </button>

        <div v-else>Email with confirmation was sent to: {{ user.email }}</div>
      </div>

      <br />

      <button v-if="user" @click.prevent="signOut">Sign Out</button>
    </div>
    <br />
    <button @click="initMobileMetamask">MOBILE METAMASK</button>

    <br />
    <br />
    <div>{{ JSON.stringify(test) }}</div>
  </main>
</template>

<script lang="ts">
import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";
import { defineComponent } from "vue";
import { googleAuthProvider, auth } from "@/firebase";
import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
} from "@firebase/auth";
import type { User } from "@firebase/auth";
import detectEthereumProvider from "@metamask/detect-provider";
import type { MetaMaskInpageProvider } from "@metamask/providers";
export default defineComponent({
  data: () => ({
    test: null as any,
    isMetamaskInstalled: false,
    error: "",
    isLoading: false,
    isRequestSent: false,
    metamask: "",
    user: null as User | null,
    provider: null as MetaMaskInpageProvider | null,
  }),

  async mounted() {
    this.isLoading = true;
    this.initMobileData();
    await this.detectMetamask();
    await this.handleRedirect();

    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.user = user;

        console.log("USER: ", user);
      }
    });

    this.isLoading = false;
  },

  methods: {
    async handleRedirect() {
      try {
        const result = await getRedirectResult(auth);

        if (result) {
          const user = result.user;

          if (!user) throw Error("User is undefined.");

          const email = user.email;

          if (!email) throw Error("Email is undefined.");

          const domain = email.split("@")[1];
          console.log(domain);
          const isWrongDomain =
            domain !== "folderly.com" && domain !== "belkins.io";

          if (isWrongDomain) {
            await auth.signOut();

            throw Error(
              "Wrong domain, only folderly.com and belkins.io allowed"
            );
          }
          console.log(user.email);
        }
      } catch (error: any) {
        this.error = error;
      }
    },
    initMobileData() {
      const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
      });
      // Check if connection is already established
      if (!connector.connected) {
        // create new session
        connector.createSession();
      }
      this.test = connector;

      // Subscribe to connection events
      connector.on("connect", (error, payload) => {
        if (error) {
          throw error;
        }
        // Get provided accounts and chainId
        const { accounts } = payload.params[0];

        if (accounts) {
          this.isMetamaskInstalled = true;
          this.metamask = accounts[0] || "";
        }
      });
    },
    async initMobileMetamask() {
      const connector = new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
        qrcodeModal: QRCodeModal,
        qrcodeModalOptions: {
          desktopLinks: ["metamask"],
          mobileLinks: ["metamask"],
        },
      });

      await connector.killSession();

      // Check if connection is already established
      if (!connector.connected) {
        // create new session
        connector.createSession();
      }

      // Subscribe to connection events
      connector.on("connect", (error, payload) => {
        if (error) {
          throw error;
        }

        // Get provided accounts and chainId
        const { accounts, chainId } = payload.params[0];

        if (accounts) {
          this.metamask = accounts[0] || "";
        }
      });
    },
    async signInGoogle() {
      await signInWithRedirect(auth, googleAuthProvider);
    },

    async signOut() {
      await auth.signOut();
      this.metamask = "";
      this.user = null;
    },
    async detectMetamask() {
      const provider =
        (await detectEthereumProvider()) as MetaMaskInpageProvider;
      if (provider) {
        this.provider = provider;
        this.isMetamaskInstalled = true;
      } else {
        this.error = "Error: Install Metamask";
      }
    },

    async signInMetamask() {
      try {
        if (this.provider) {
          const accounts = await this.provider.request<string[]>({
            method: "eth_requestAccounts",
          });

          if (accounts) {
            this.metamask = accounts[0] || "";
          }
        }
      } catch (error: any) {
        this.error = error;
      }
    },

    setError(error: string) {
      this.error = error;
      setTimeout(() => {
        this.error = "";
      }, 2000);
    },

    async sendRequest() {
      if (this.user && this.metamask) {
        // await axios.post("", {
        //   email: this.user.email,
        //   metamask: this.metamask,
        // });
        this.isRequestSent = true;
      }
    },
  },
});
</script>
