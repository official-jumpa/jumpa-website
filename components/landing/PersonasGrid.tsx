export default function PersonasGrid() {
  return (
    <section
      className="flex flex-col gap-32 py-28 px-14 bg-[#FFFEFB]"
      id="use-cases"
    >
      <div className="flex flex-col items-center text-center">
        <h2 className="persona text-6xl leading-22.5">
          How Jumpa fit into Everyday Life
        </h2>
        <p className="text-[28px]">Move money anywhere in minutes.</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-[2fr_1fr] gap-2">
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-24 justify-between overflow-hidden bg-[#1D1D1D] pt-6 pl-6 rounded-[10px]">
              <div className="flex flex-col gap-3 text-white max-w-110">
                <h3 className="text-[23.35px]">The African Importer/Trader</h3>
                <p className="text-[14px] text-[#BFBFBF]">
                  Amara runs a clothing business in Lagos. She needs to pay her
                  supplier in Guangzhou $2,000. Normally that means queuing at a
                  bank, paying 8% above the parallel rate, waiting 5 days. With
                  Jumpa she types "Pay $2,000 to Zhao Wei" in Jumpa. Done in
                  minutes, settled in USDC, supplier can swap to local currency
                  in Jumpa, no middleman.
                </p>
              </div>
              <div className="shrink-0">
                <img
                  src="/assets/images/illustrations/building-ill.svg"
                  alt=""
                  width={291}
                />
              </div>
            </div>

            <div className="flex items-start gap-24 justify-between overflow-hidden bg-[#1D1D1D] pt-6 pl-6 rounded-[10px]">
              <div className="flex flex-col gap-3 text-white max-w-110">
                <h3 className="text-[23.35px]">The Diaspora Family</h3>
                <p className="text-[14px] text-[#BFBFBF]">
                  A Nigerian mother in London wants to send 50,000 naira home to
                  her parents. Western Union charges £8 + bad rates. She types
                  "Send 50k naira to Mum" - Jumpa converts, routes, and her
                  parents receive it via mobile money or bank transfer. Under 2
                  minutes.
                </p>
              </div>
              <div className="shrink-0">
                <img src="/assets/images/family.png" alt="" width={340} />
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center overflow-hidden bg-[#1D1D1D] pt-8 px-8 justify-between rounded-[10px]">
            <div className="flex flex-col gap-3 text-white">
              <h3 className="text-[23.35px]">The Freelancer</h3>
              <p className="text-[14px] text-[#BFBFBF]">
                Kofi in Vietnan does design work for a client in Canada. Getting
                paid via PayPal costs 4.5% + conversion loss. His bank account
                barely accepts international wires. With Jumpa, his client sends
                USDC directly, Kofi converts it at market rate and withdraws in
                cedis or just saves it in his USD account to avoid cedi
                devaluation.
              </p>
            </div>
            <div className="shrink-0">
              <img src="/assets/images/freelancer.png" alt="" width={364} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_2fr] gap-2">
          <div className="flex flex-col items-center overflow-hidden bg-[#1D1D1D] pt-8 px-8 justify-between rounded-[10px]">
            <div className="flex flex-col gap-3 text-white">
              <h3 className="text-[23.35px]">
                The Small Business Owner (Francophone Africa)
              </h3>
              <p className="text-[14px] text-[#BFBFBF]">
                A shop owner in Douala, Cameroon sells to customers across West
                Africa. Most neobanks don't even have French interfaces. Jumpa
                works in French, accepts payments via a simple
                Cryptopayment.link, and settles in CFA or USDC - whatever
                protects value better that day.
              </p>
            </div>
            <div className="shrink-0">
              <img src="/assets/images/business-owner.png" alt="" width={364} />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-24 justify-between overflow-hidden bg-[#1D1D1D] pt-6 pl-6 rounded-[10px]">
              <div className="flex flex-col gap-3 text-white max-w-110">
                <h3 className="text-[23.35px]">Traveler</h3>
                <p className="text-[14px] text-[#BFBFBF]">
                  A backpacker moving from Thailand to Vietnam to Nigeria
                  doesn't want to carry cash or get destroyed by airport forex.
                  They tell Jumpa "I need 5,000 baht" before landing and the
                  conversion is already handled at a real rate.
                </p>
              </div>
              <div className="shrink-0">
                <img src="/assets/images/traveler.png" alt="" width={291} />
              </div>
            </div>

            <div className="flex items-start gap-24 justify-between overflow-hidden bg-[#1D1D1D] pt-6 pl-6 rounded-[10px]">
              <div className="flex flex-col gap-3 text-white max-w-110">
                <h3 className="text-[23.35px]">
                  The SME Paying Suppliers Across Africa
                </h3>
                <p className="text-[14px] text-[#BFBFBF]">
                  A manufacturer in Nairobi buys raw materials from suppliers in
                  Senegal, South Africa, and Egypt. Cross-border B2B payments
                  within Africa are the world's most expensive. Jumpa lets them
                  pay any supplier in any country, in local currency or USDC,
                  without a correspondent banking chain eating 6-12%.
                </p>
              </div>
              <div className="shrink-0">
                <img src="/assets/images/supplier.png" alt="" width={340} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
