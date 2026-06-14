import { quickTransfers } from "@/data/quickTransfers";

const QuickTransferList: React.FC = () => {
  return (
    <div className="w-full h-[134px] bg-[#2d2d2d] rounded-2xl p-4 flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-[#f3f3f5] m-0">Quick transfer</h3>
      <div className="flex gap-4 overflow-x-auto scrollbar-none flex-1 items-center">
        {quickTransfers.map((c) => (
          <button key={c.id} className="flex flex-col items-center gap-1 bg-transparent border-none cursor-pointer p-0 group" type="button">
            <div className="w-12 h-12 rounded-full overflow-hidden transition-transform duration-150 ease-out group-hover:scale-105">
              <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" />
            </div>
            <span className="text-[11px] text-[#b7b7be]">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickTransferList;
