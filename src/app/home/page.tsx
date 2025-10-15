import Card from "@/components/ui/home/card";
import Todo from "@/components/ui/home/episode";

function Home() {
  return (
    <>
    <div className="flex row-reverse">
       <div className="w-full"> <Todo /> </div>
       <div className="w-0 md:w-1/3 max-h-screen">
        <Card />
       </div>

      </div>
    </>
  )
}

export default Home;