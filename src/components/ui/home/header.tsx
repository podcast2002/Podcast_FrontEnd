import Image from "next/image";
import Flat from "../../../../public/images/Flat.png";
import Podcastr from "../../../../public/images/Podcastr.png";
import { useRouter } from "next/navigation";

function Header() {

  const router = useRouter();

  return (
    <>
      <div className="h-[104px] w-full border-b-[1px] border-b-[#E1E1E1] flex items-center justify-between px-[64px] py-[32px] bg-[#FFFFFF]">
        <div className="flex items-center justify-center text-center gap-8">
          <div onClick={() => router.push('/home')} className="flex items-center gap-4 cursor-pointer">
            <Image src={Flat} alt="logo" width={40} height={40} />
            <Image src={Podcastr} alt="logo" width={103.5} height={18} />
          </div>
          <div className="flex items-center">
            <span className="text-[14px] font-medium w-[1px] h-[24px] bg-[#E6E8EB]"></span>
          </div>
          <div>
            <p className="hidden md:block text-[14px] text-[#808080] ">
              O melhor para você ouvir, sempre
            </p>
          </div>
        </div>

        <div>
          <p className="text-[14px] text-[#808080] ">Qui, 8 Abril</p>
        </div>
      </div>
    </>
  );
}

export default Header;
