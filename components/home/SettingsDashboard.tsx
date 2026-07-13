"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Wallet,
  Moon,
  Bell,
  Contact,
  Banknote,
  KeyRound,
  MessageSquare,
  AtSign,
  LogOut,
  ChevronRight,
} from "lucide-react";
import WalletEditModal from "@/components/modal/WalletEditModal";
import NotificationModal from "@/components/modal/NotificationModal";
import SignOutModal from "@/components/modal/SignOutModal";

export default function SettingsDashboard() {
  const router = useRouter();

  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
  const [walletName, setWalletName] = useState("Wallet");
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(walletName);

  const handleSaveWallet = () => {
    setWalletName(tempName);
    setEditingName(false);
    setIsWalletModalOpen(false);
  };

  const openWalletModal = () => {
    setTempName(walletName);
    setEditingName(false);
    setIsWalletModalOpen(true);
  };

  const openNotificationModal = () => {
    setIsNotificationModalOpen(true);
  };

  const handleConfirmSignOut = () => {
    setIsSignOutModalOpen(false);
    router.push("/onboarding");
  };

  const CustomSwitch = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: () => void;
  }) => (
    <div
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? "bg-[#9853F5]" : "bg-gray-600"}`}
      onClick={onChange}
    >
      <div
        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${checked ? "translate-x-6" : "translate-x-0"}`}
      />
    </div>
  );

  return (
    <div className="relative h-full text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-6">
        <h1 className="text-[28px] font-semibold tracking-tight">Settings</h1>
      </div>

      <div className="flex-1 px-6 pb-24 overflow-y-auto scrollbar-none">
        {/* General Section */}
        <div className="mb-8">
          <h2 className="text-[#8e8e93] text-sm font-medium mb-4 px-1">
            General
          </h2>
          <div className="flex flex-col gap-1">
            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={openWalletModal}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                      fill="#6A59CE"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M13.6524 7.27123C12.5635 7.03101 11.4349 7.03101 10.346 7.27123L10.1182 7.32148C8.59743 7.65697 7.39848 8.8209 7.02301 10.3263C6.74884 11.4255 6.74884 12.5748 7.02301 13.6741C7.39848 15.1794 8.59743 16.3433 10.1182 16.6788L10.346 16.7291C11.4349 16.9693 12.5635 16.9693 13.6524 16.7291L13.8802 16.6788C15.401 16.3433 16.5999 15.1794 16.9754 13.6741C17.2496 12.5748 17.2496 11.4255 16.9754 10.3263C16.5999 8.8209 15.401 7.65697 13.8802 7.32148L13.6524 7.27123ZM15.241 10.8044C15.4466 10.7695 15.6548 10.7571 15.8614 10.7667C16.0884 10.7772 16.267 10.9543 16.2975 11.1785C16.3717 11.7238 16.3717 12.2766 16.2975 12.8218C16.267 13.046 16.0884 13.2231 15.8614 13.2336C15.6548 13.2432 15.4466 13.2308 15.241 13.1959L15.2007 13.1891C14.6651 13.0983 14.2512 12.7369 14.1113 12.2815C14.0547 12.0974 14.0547 11.9029 14.1113 11.7188C14.2512 11.2634 14.6651 10.902 15.2007 10.8112L15.241 10.8044ZM9.46043 10.3514C9.46043 10.1693 9.60869 10.0217 9.79158 10.0217L11.9992 10.0217C12.1821 10.0217 12.3304 10.1693 12.3304 10.3514C12.3304 10.5335 12.1821 10.6812 11.9992 10.6812H9.79158C9.60869 10.6812 9.46043 10.5335 9.46043 10.3514Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Edit wallet</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl cursor-pointer">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12.4545C0 5.57609 5.57609 0 12.4545 0C19.333 0 24.9091 5.57609 24.9091 12.4545C24.9091 19.333 19.333 24.9091 12.4545 24.9091C5.57609 24.9091 0 19.333 0 12.4545Z"
                      fill="#25AD3E"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M13.1073 7.29609C12.9959 7.33051 12.9037 7.38942 12.8279 7.47576C12.6535 7.67467 12.6401 7.87534 12.7789 8.22301C13.0374 8.86009 13.1024 9.55922 12.9659 10.2331C12.8293 10.9069 12.4972 11.5255 12.0111 12.0117C11.525 12.4979 10.9064 12.8301 10.2325 12.9667C9.55873 13.1034 8.85959 13.0384 8.22247 12.78C7.88589 12.6453 7.67589 12.6575 7.4828 12.8226C7.27747 12.9982 7.24189 13.1773 7.33114 13.5862C7.47148 14.2037 7.71864 14.792 8.06147 15.3245C8.89505 16.5921 10.1842 17.4134 11.7108 17.6497C12.076 17.7063 12.8308 17.7063 13.2006 17.6497C14.344 17.4747 15.3642 16.9631 16.1634 16.1639C17.0762 15.2492 17.6199 14.0302 17.6904 12.7398C17.7609 11.4495 17.3532 10.1784 16.5455 9.16976C15.8058 8.24809 14.729 7.57842 13.5921 7.33342C13.3109 7.27276 13.2094 7.26517 13.1073 7.29609ZM14.3271 8.82909C14.8067 9.07501 15.2317 9.41529 15.5766 9.82951C16.0311 10.368 16.3379 11.0152 16.4671 11.7079C16.5962 12.4006 16.5432 13.1149 16.3133 13.781C15.9651 14.7925 15.2339 15.627 14.2769 16.105C12.4785 17.0051 10.3003 16.4597 9.1243 14.8158C8.98372 14.6193 8.72939 14.1648 8.74864 14.145C8.79838 14.1427 8.84819 14.1471 8.8968 14.1578C9.15347 14.1998 9.63414 14.2115 9.93397 14.1829C10.506 14.1354 11.064 13.9809 11.579 13.7273C13.2969 12.8885 14.337 11.0796 14.1853 9.19542C14.1767 9.06208 14.1625 8.92916 14.1427 8.79701C14.1351 8.76784 14.1351 8.74451 14.1433 8.74451C14.1515 8.74451 14.2343 8.78242 14.3271 8.82909Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Dark mode</span>
              </div>
              <CustomSwitch
                checked={darkMode}
                onChange={() => setDarkMode(!darkMode)}
              />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={openNotificationModal}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                      fill="#EE9C2E"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.235 15.4274C10.2276 15.3932 10.2216 15.3589 10.217 15.3245C9.83537 15.277 9.45508 15.2142 9.07708 15.1362L8.88974 15.0975C8.16 14.9468 7.63574 14.2961 7.63574 13.541C7.63574 12.9978 7.90461 12.5189 8.3139 12.2326C8.19705 11.4749 8.23881 10.7003 8.43683 9.95944L8.46413 9.8573C8.79081 8.63505 9.71613 7.661 10.9013 7.27154C11.6345 7.03059 12.4325 7.0299 13.1661 7.27551C14.3339 7.6665 15.2271 8.63037 15.5393 9.83648L15.5758 9.97753C15.7663 10.7137 15.8034 11.4817 15.6851 12.2328C16.0942 12.5191 16.363 12.9979 16.363 13.541C16.363 14.2961 15.8388 14.9468 15.109 15.0975L14.9217 15.1362C14.5437 15.2142 14.1634 15.277 13.7817 15.3245C13.7771 15.3589 13.7711 15.3932 13.7638 15.4274L13.7276 15.5949C13.5955 16.2075 13.129 16.6892 12.5274 16.8344L12.4296 16.858C12.1468 16.9263 11.852 16.9263 11.5691 16.858L11.4714 16.8344C10.8698 16.6892 10.4033 16.2075 10.2711 15.5949L10.235 15.4274ZM10.9948 15.3999C11.6637 15.4465 12.335 15.4465 13.004 15.3999L12.9968 15.4329C12.9261 15.7609 12.6763 16.0189 12.3541 16.0966L12.2564 16.1202C12.0874 16.161 11.9114 16.161 11.7424 16.1202L11.6447 16.0966C11.3225 16.0189 11.0727 15.7609 11.0019 15.4329L10.9948 15.3999Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Notification</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/address-book")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                      fill="#1969FE"
                    />
                    <path
                      d="M10.8769 7.09131C9.55998 7.09131 8.49244 8.15885 8.49244 9.47572C8.49244 10.7926 9.55998 11.8601 10.8769 11.8601C12.1937 11.8601 13.2613 10.7926 13.2613 9.47572C13.2613 8.15885 12.1937 7.09131 10.8769 7.09131Z"
                      fill="black"
                    />
                    <path
                      d="M12.284 12.9209C11.3518 12.7722 10.4019 12.7722 9.46973 12.9209L9.36981 12.9369C8.05633 13.1465 7.08984 14.2795 7.08984 15.6096C7.08984 16.3275 7.67183 16.9095 8.38975 16.9095H13.364C14.0819 16.9095 14.6639 16.3275 14.6639 15.6096C14.6639 14.2795 13.6974 13.1465 12.3839 12.9369L12.284 12.9209Z"
                      fill="black"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M15.3652 10.4575C15.5976 10.4575 15.7859 10.6459 15.7859 10.8783V11.5796H16.4872C16.7196 11.5796 16.908 11.768 16.908 12.0004C16.908 12.2328 16.7196 12.4212 16.4872 12.4212H15.7859V13.1225C15.7859 13.3549 15.5976 13.5433 15.3652 13.5433C15.1328 13.5433 14.9444 13.3549 14.9444 13.1225V12.4212H14.2431C14.0107 12.4212 13.8223 12.2328 13.8223 12.0004C13.8223 11.768 14.0107 11.5796 14.2431 11.5796H14.9444V10.8783C14.9444 10.6459 15.1328 10.4575 15.3652 10.4575Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Address book</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/price-limit")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12.4545C0 5.57609 5.57609 0 12.4545 0C19.333 0 24.9091 5.57609 24.9091 12.4545C24.9091 19.333 19.333 24.9091 12.4545 24.9091C5.57609 24.9091 0 19.333 0 12.4545Z"
                      fill="#FF2524"
                    />
                    <path
                      d="M12.4544 6.62134C15.6762 6.62134 18.2878 9.23292 18.2878 12.4547C18.2878 15.6764 15.6762 18.288 12.4544 18.288C9.23268 18.288 6.62109 15.6764 6.62109 12.4547C6.62109 9.23292 9.23268 6.62134 12.4544 6.62134ZM12.042 10.392L10.3918 12.0423C10.2824 12.1516 10.221 12.3 10.221 12.4547C10.221 12.6094 10.2824 12.7577 10.3918 12.8671L12.042 14.5173C12.1514 14.6267 12.2997 14.6881 12.4544 14.6881C12.6091 14.6881 12.7575 14.6267 12.8668 14.5173L14.5171 12.8671C14.6265 12.7577 14.6879 12.6094 14.6879 12.4547C14.6879 12.3 14.6265 12.1516 14.5171 12.0423L12.8668 10.392C12.7575 10.2826 12.6091 10.2212 12.4544 10.2212C12.2997 10.2212 12.1514 10.2826 12.042 10.392Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Price Limit</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => router.push("/settings/forgot-pin")}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12.4045C0 5.55371 5.5537 0 12.4045 0C19.2554 0 24.8091 5.55371 24.8091 12.4045C24.8091 19.2554 19.2554 24.8091 12.4045 24.8091C5.55371 24.8091 0 19.2554 0 12.4045Z"
                      fill="#FF2E9B"
                    />
                    <g clip-path="url(#clip0_6_9790)">
                      <path
                        d="M14.2199 7.27711L14.2747 7.32553L17.4831 10.5339C17.5814 10.6327 17.6411 10.7635 17.6513 10.9026C17.6615 11.0417 17.6215 11.1798 17.5386 11.2919C17.4558 11.4041 17.3355 11.4828 17.1995 11.5139C17.0636 11.545 16.921 11.5263 16.7977 11.4614L14.9473 13.3111L14.1167 15.526C14.0948 15.5845 14.0637 15.639 14.0245 15.6876L13.9837 15.7343L13.1087 16.6093C13.0081 16.7096 12.8745 16.7699 12.7327 16.7787C12.5909 16.7875 12.4508 16.7443 12.3387 16.6571L12.2832 16.6087L10.654 14.98L8.4414 17.192C8.33643 17.2966 8.19557 17.3574 8.04743 17.3619C7.89929 17.3664 7.75499 17.3144 7.64382 17.2164C7.53266 17.1184 7.46297 16.9817 7.44892 16.8342C7.43486 16.6866 7.4775 16.5393 7.56815 16.422L7.61657 16.3672L9.82857 14.1546L8.1999 12.5254C8.09947 12.4249 8.03913 12.2913 8.03022 12.1495C8.0213 12.0077 8.06442 11.8676 8.15149 11.7554L8.1999 11.7005L9.0749 10.8255C9.11892 10.7814 9.16973 10.7445 9.2254 10.7164L9.28257 10.6919L11.4969 9.8607L13.3467 8.01153C13.2836 7.8936 13.2629 7.75757 13.2882 7.62624C13.3135 7.49491 13.3831 7.37624 13.4854 7.29012C13.5877 7.204 13.7165 7.15565 13.8502 7.15318C13.984 7.1507 14.1145 7.19483 14.2199 7.27711Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_6_9790">
                        <rect
                          width="13.9"
                          height="13.9"
                          fill="white"
                          transform="translate(5.4541 5.45459)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Forgot Pin</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* About Section */}
        <div>
          <h2 className="text-[#8e8e93] text-sm font-medium mb-4 px-1">
            About
          </h2>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12Z"
                      fill="#25AD3E"
                    />
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M10.5365 7.26846C8.91385 7.6353 7.64067 8.8823 7.25004 10.4873C7.03645 11.3649 7.0384 12.2884 7.252 13.166C7.64873 14.7961 8.81575 16.1528 10.3813 16.7849L10.4495 16.8124C11.127 17.086 11.9031 16.7565 12.181 16.0853C12.2576 15.9006 12.4397 15.778 12.641 15.778H13.254C14.9211 15.778 16.3713 14.6453 16.7626 13.0375C16.9569 12.2391 16.9569 11.4062 16.7626 10.6078L16.7113 10.397C16.3341 8.84732 15.1048 7.64329 13.5381 7.2891L13.318 7.23934C12.445 7.04196 11.5383 7.04196 10.6653 7.23934L10.5365 7.26846ZM10.0917 10.0184C9.88181 10.0184 9.71168 10.1872 9.71168 10.3954C9.71168 10.6036 9.88181 10.7724 10.0917 10.7724H13.575C13.7848 10.7724 13.955 10.6036 13.955 10.3954C13.955 10.1872 13.7848 10.0184 13.575 10.0184H10.0917ZM10.725 11.9034C10.5151 11.9034 10.345 12.0722 10.345 12.2805C10.345 12.4887 10.5151 12.6575 10.725 12.6575H12.9416C13.1515 12.6575 13.3216 12.4887 13.3216 12.2805C13.3216 12.0722 13.1515 11.9034 12.9416 11.9034H10.725Z"
                      fill="black"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Contact support</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 22 22"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 10.9545C0 4.90452 4.90452 0 10.9545 0C17.0046 0 21.9091 4.90452 21.9091 10.9545C21.9091 17.0046 17.0046 21.9091 10.9545 21.9091C4.90452 21.9091 0 17.0046 0 10.9545Z"
                      fill="#FF2E9B"
                    />
                    <g clipPath="url(#clip0_6_9809)">
                      <path
                        d="M5.52423 5.45459H8.76235L11.645 9.57753L15.1066 5.45459H16.1413L12.0404 10.1433L16.4541 16.4546H13.216L10.2054 12.1495L6.4881 16.4546H5.4541L9.81079 11.585L5.52423 5.45459Z"
                        fill="black"
                      />
                    </g>
                    <defs>
                      <clipPath id="clip0_6_9809">
                        <rect
                          width="11"
                          height="11"
                          fill="white"
                          transform="translate(5.4541 5.45459)"
                        />
                      </clipPath>
                    </defs>
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Follow @JumpaHQ</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>

            <div
              className="flex items-center justify-between p-3 active:bg-[#2C2C2E] rounded-xl cursor-pointer transition-colors"
              onClick={() => setIsSignOutModalOpen(true)}
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0 11.9995C0 5.37238 5.37238 0 11.9995 0C18.6267 0 23.9991 5.37238 23.9991 11.9995C23.9991 18.6267 18.6267 23.9991 11.9995 23.9991C5.37238 23.9991 0 18.6267 0 11.9995Z"
                      fill="#EE9C2E"
                    />
                    <path
                      d="M14.7267 9.8179L16.9083 11.9996L14.7267 14.1812M16.9083 11.9996H9.27249M12.545 14.1812V14.7266C12.545 15.1606 12.3726 15.5768 12.0657 15.8837C11.7589 16.1905 11.3427 16.3629 10.9087 16.3629H8.72707C8.29311 16.3629 7.87692 16.1905 7.57007 15.8837C7.26321 15.5768 7.09082 15.1606 7.09082 14.7266V9.27248C7.09082 8.83852 7.26321 8.42233 7.57007 8.11548C7.87692 7.80862 8.29311 7.63623 8.72707 7.63623H10.9087C11.3427 7.63623 11.7589 7.80862 12.0657 8.11548C12.3726 8.42233 12.545 8.83852 12.545 9.27248V9.8179"
                      stroke="black"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[16px] font-medium">Sign out</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <WalletEditModal
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        walletName={walletName}
        tempName={tempName}
        editingName={editingName}
        setTempName={setTempName}
        setEditingName={setEditingName}
        onSave={handleSaveWallet}
      />

      <NotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        notificationsEnabled={notifications}
        setNotificationsEnabled={setNotifications}
      />

      <SignOutModal
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleConfirmSignOut}
      />
    </div>
  );
}
