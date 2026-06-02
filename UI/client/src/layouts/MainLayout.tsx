import useWindowSize from "@/hooks/useWindowsSize";
import { Outlet } from "react-router-dom";
// import { Footer, Header } from "../common";

export default function MainLayout() {
  // const [openModal, setOpenModal] = useState<"chat" | "userInfo" | null>(null);
  // const userInfoRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowSize();
  // const chatRef = useRef<HTMLDivElement>(null);

  // const openUserInfo = () => {
  //   if (openModal === "chat") {
  //     setOpenModal(null);
  //   }
  //   setOpenModal("userInfo");
  // };

  // const closeModals = () => setOpenModal(null);

  // useEffect(() => {
  //   const handleClickOutside = (event: MouseEvent) => {
  //     if (
  //       userInfoRef.current &&
  //       !userInfoRef.current.contains(event.target as Node) &&
  //       chatRef.current &&
  //       !chatRef.current.contains(event.target as Node)
  //     ) {
  //       closeModals();
  //     }
  //   };

  //   if (openModal) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //     document.body.style.overflow = "hidden";
  //   } else {
  //     document.body.style.overflow = "unset";
  //   }

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //     document.body.style.overflow = "unset";
  //   };
  // }, [openModal]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header openUserInfo={openUserInfo} className="flex-shrink-0" /> */}
      <main
        className={`flex-grow py-16 px-4 md:py-8 md:px-10 ${
          isMobile ? "mt-[140px]" : ""
        }`}
      >
        <Outlet />
      </main>
      {/* <Footer className="flex-shrink-0 relative z-30" /> */}
    </div>
  );
}
