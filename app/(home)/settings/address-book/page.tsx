"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users, Plus, Wallet } from "lucide-react";
import AddContactModal from "@/components/modal/AddContactModal";

interface Contact {
  name: string;
  address: string;
}

function truncateAddress(address: string) {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}... ${address.slice(-2)}`;
}

export default function AddressBookPage() {
  const router = useRouter();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddContact = (name: string, address: string) => {
    setContacts((prev) => [...prev, { name, address }]);
  };

  return (
    <div className="relative h-full text-white flex flex-col font-sans">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 shrink-0">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-[#2C2C2E] flex items-center justify-center hover:bg-[#3A3A3C] transition-colors mb-6"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <h1 className="text-[28px] font-semibold tracking-tight mb-3">
          Address book
        </h1>
        <p className="text-[#8E8E93] text-[14px] leading-relaxed max-w-75">
          Save frequently used addresses and account number for easy access.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-none px-6">
        {contacts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center pb-16">
            <div className="mb-6">
              <Users className="w-20 h-20 text-[#7C3AED]" strokeWidth={1} />
            </div>
            <h2 className="text-[16px] font-medium text-white mb-2">
              No Contacts yet
            </h2>
            <p className="text-[#8E8E93] text-[13px]">
              Add contacts to your address book
            </p>
          </div>
        ) : (
          <div className="pb-6">
            {/* Section header */}
            <p className="text-[#8E8E93] text-[13px] font-medium mb-3">
              Contact
            </p>
            {contacts.map((contact, i) => (
              <div
                key={i}
                className="flex items-center gap-3 py-3 active:bg-[#2C2C2E] rounded-xl transition-colors cursor-pointer"
              >
                {/* Wallet icon avatar */}
                <div className="w-10 h-10 rounded-xl bg-[#2C2C2E] flex items-center justify-center shrink-0">
                  <Wallet
                    className="w-5 h-5 text-[#8E8E93]"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-[15px] font-medium">
                    {contact.name}
                  </p>
                  <p className="text-[#8E8E93] text-[12px] font-mono">
                    {truncateAddress(contact.address)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Contact Button — pinned to bottom */}
      <div className="shrink-0 flex justify-end px-6 py-6">
        <button
          className="flex items-center gap-2 bg-[#2C2C2E] text-white px-5 py-3 rounded-full hover:bg-[#3A3A3C] transition-colors shadow-lg"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span className="text-[14px] font-medium">Add contact</span>
        </button>
      </div>

      {/* Add Contact Modal */}
      <AddContactModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddContact}
      />
    </div>
  );
}
