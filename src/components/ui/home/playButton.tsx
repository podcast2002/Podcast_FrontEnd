import { Play } from "lucide-react"

function PlayButton() {
    return(
        <>
            <div className="w-[40px] h-[40px] border-[1px] rounded-lg flex cursor-pointer items-center justify-center">
            <span><Play color="#04D361" strokeWidth={2} fill="#04D361" className="w-[14px] h-[14px] " />  </span>
            </div>

        </>
    )
}

export default PlayButton