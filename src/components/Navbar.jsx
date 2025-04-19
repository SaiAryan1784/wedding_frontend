import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import NavbarRoutesConfig from "../assets/NavabarRouteConfig";
import { useSelector } from "react-redux";
import { allCategories } from "../static/static";
import Avatar from "../../public/user.png";
import brandlogo from "../../public/logo/brandlogo.png";
import { User } from "lucide-react";
import UserSideBar from "../pages/userDashboard/UserSideBar";

function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [dropdown, setDropdown] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleOnProfile = () => {
    navigate("/profile");
  };

  const handleNavigate = (category, subcategories) => {
    setIsMenuOpen(false);
    const categorySlug = category.toLowerCase().replace(/\s+/g, "-");
    const subcategoriesSlug = subcategories.toLowerCase().replace(/\s+/g, "-");
    navigate(`/all/${categorySlug}/${subcategoriesSlug}`);
  };

  const sidebarRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.matchMedia("(min-width: 1024px)").matches) {
        setIsProfileOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleMenu = () => setIsMenuOpen((prev) => !prev);

  const toggleProfile = () => setIsProfileOpen((prev) => !prev);

  const categories = [
    { title: "Venue", key: "Wedding Venue", gridCols: 1, width: "w-48" },
    { title: "Vendor", key: "Wedding Vendor", gridCols: 2, width: "w-96" },
    { title: "Brides", key: "Bride", gridCols: 1, width: "w-48" },
    { title: "Grooms", key: "Groom", gridCols: 1, width: "w-48" },
  ];

  return (
    <>
      <div
        className={`${
          location.pathname === "/vendorLogin" ||
          location.pathname === "/vendorSignup"
            ? "hidden"
            : "block"
        }`}
      >
        <>
          {/* <TopNavbar /> */}
          <nav className="w-full bg-white top-0 px-6 md:px-16 z-50 shadow-sm">
            <div
              className={`w-full lg:flex lg:justify-between lg:items-center  py-4 ${
                user != null
                  ? "flex justify-between items-center"
                  : "flex justify-start items-center gap-4"
              }`}
            >
              <button
                className="block lg:hidden text-gray-800"
                onClick={toggleMenu}
              >
                {!isMenuOpen && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    className="h-10 w-10"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>
              <div className="text-2xl font-bold text-primary cursor-pointer">
                <NavLink
                  to="/"
                  className={`flex ${
                    user != null
                      ? "flex-col items-center"
                      : "flex-row items-center gap-2"
                  } lg:gap-3 lg:flex-row  cursor-pointer`}
                >
                  <img
                    src={brandlogo}
                    alt="brandlogo"
                    className={` ${user != null ? "w-10 h-10" : "w-7 h-7"} md:w-8 md:h-8 lg:w-10 lg:h-10`}
                  />
                  <span
                    className={` xl:block text-primary  lg:text-2xl ${
                      user != null ? "hidden md:block text-lg" : "text-xl "
                    }`}
                  >
                    Marriage Vendors
                  </span>
                </NavLink>
              </div>

              <ul
                className={`
              flex flex-col lg:flex-row lg:gap-4 gap-4
              absolute lg:relative z-50 rounded-tr-lg rounded-br-lg
              bg-white text-gray-600 font-medium
              h-screen lg:h-0 w-3/4 left-0 top-0
              lg:w-auto lg:top-auto lg:items-center
              px-4 py-4 lg:py-0 lg:px-0 transition-transform
              duration-300 ease-in-out  ${
                isMenuOpen ? "translate-x-0" : "-translate-x-full"
              } lg:translate-x-0`}
              >
                <div className="flex items-center gap-2 lg:hidden">
                  <img
                    src={brandlogo}
                    alt="brandlogo"
                    className={`w-5 h-5`}
                  />
                  <span className={`text-primary text-xl `}>
                    Marriage Vendors
                  </span>
                </div>
                <hr />
                
                {NavbarRoutesConfig.map((route) => (
                  <li key={route.path} className="lg:inline-block">
                    <NavLink
                      to={route.path}
                      onClick={() => setIsMenuOpen(false)}
                      className={({ isActive }) =>
                        isActive
                          ? "text-primary border-b-2 border-primary pb-1"
                          : "hover:text-primary"
                      }
                    >
                      {route.name}
                    </NavLink>
                  </li>
                ))}

                {/* drop down  */}
                {categories.map(({ title, key, gridCols, width }) => (
                  <DropdownMenu
                    key={key}
                    title={title}
                    categoryKey={key}
                    allCategories={allCategories}
                    dropdown={dropdown}
                    setDropdown={setDropdown}
                    handleNavigate={handleNavigate}
                    gridCols={gridCols}
                    width={width}
                  />
                ))}
                <li className="cursor-pointer">
                  <NavLink to="/templates">Invitation</NavLink>
                </li>
                <li className="cursor-pointer">
                  <NavLink to="/blogs">Blog</NavLink>
                </li>
                <li className="cursor-pointer border px-2 py-2 lg:px-2 lg:py-1 rounded-md hover:bg-pink-50 ">
                  <NavLink to="/vendorLogin" className="">
                    Vendor Login
                  </NavLink>
                </li>

                {user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN" ? (
                  <></>
                ) : (
                  <>
                    <li className="lg:inline-block">
                      <NavLink
                        to="/admin"
                        onClick={() => setIsMenuOpen(false)}
                        className={({ isActive }) =>
                          isActive
                            ? "text-primary px-3 py-1 border border-primary  rounded-md"
                            : "px-3 py-1 text-primary border border-primary rounded-md"
                        }
                      >
                        ADMIN
                      </NavLink>
                    </li>
                  </>
                )}

                {user?.role !== "USER" &&
                user?.role !== "ADMIN" &&
                user?.role !== "SUPER_ADMIN" ? (
                  <>
                    <li className="text-primary lg:inline-block cursor-pointer border border-primary px-2 py-2 lg:px-2 lg:py-1 rounded-md hover:bg-pink-50">
                      <NavLink
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                       
                      >
                        Login
                      </NavLink>
                    </li>
                    <li 
                    className="hidden xl:block cursor-pointer whitespace-nowrap bg-primary border border-primary px-2 py-2 lg:px-2 lg:py-1 rounded-md hover:bg-pink-50 hover:text-primary text-white"
                    >
                      <NavLink
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Sign up
                      </NavLink>
                    </li>
                  </>
                ) : (
                  <li className="lg:inline-block border px-2 py-2 rounded-md lg:border-none lg:p-0 w-full lg:w-auto">
                    <div
                      onClick={handleOnProfile}
                      className="flex items-center gap-x-2 cursor-pointer w-full"
                    >
                      <img
                        src={user?.profile_photo || Avatar}
                        alt="Profile"
                        className="w-12 h-12 lg:w-8 lg:h-8 rounded-full"
                      />
                      <p className="lg:hidden flex flex-col gap-1 items-start justify-between w-full pr-5">
                        <span className="capitalize">{user?.user_name}</span>
                        <span className="lowercase text-xs rounded-full border px-3 py-1">
                          {user?.role}
                        </span>
                      </p>
                    </div>
                  </li>
                )}
              </ul>

              {user?.role === "USER" && (
                <User
                  onClick={toggleProfile}
                  className="lg:hidden cursor-pointer"
                  size={34}
                />
              )}
            </div>
            {/* Background Overlay */}
            <div
              className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
                isMenuOpen
                  ? "opacity-100 backdrop-blur-md"
                  : "opacity-0 pointer-events-none"
              } z-40`}
              onClick={() => setIsMenuOpen(false)}
            />
          </nav>

          <div
            className={`fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm 
    transition-opacity duration-300 ease-in-out
    ${
      isProfileOpen
        ? "opacity-100 pointer-events-auto"
        : "opacity-0 pointer-events-none"
    }`}
          >
            <div
              ref={sidebarRef}
              className={`fixed top-0 left-0 z-50 w-64 h-screen shadow-lg 
      transform transition-transform duration-300 ease-in-out
      ${isProfileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <UserSideBar customClass={"h-screen pt-10"} />
            </div>
          </div>
        </>
      </div>
    </>
  );
}

export default Navbar;

const DropdownMenu = ({
  title,
  categoryKey,
  allCategories,
  dropdown,
  setDropdown,
  handleNavigate,
  gridCols = 1,
  width = "w-48",
}) => {
  return (
    <li
      className="relative lg:inline-block "
      onMouseEnter={() => setDropdown(categoryKey)}
      onMouseLeave={() => setDropdown("")}
    >
      <span className="cursor-pointer hover:text-primary">{title}</span>
      {dropdown === categoryKey && (
        <div
          className={`absolute left-0 top-full bg-white shadow-lg ${width} py-4 z-40 `}
        >
          <ul className={`grid grid-cols-${gridCols} gap-4 px-4`}>
            {Object.entries(allCategories)
              .filter(([category]) => category === categoryKey)
              .flatMap(([category, subcategories]) =>
                subcategories.map((subcategory, index) => (
                  <li key={index}>
                    <button
                      onClick={() => handleNavigate(category, subcategory)}
                      className="block text-left w-full hover:text-primary"
                    >
                      {subcategory}
                    </button>
                  </li>
                ))
              )}
          </ul>
        </div>
      )}
    </li>
  );
};
