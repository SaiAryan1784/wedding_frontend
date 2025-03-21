import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Flame, TrendingUp, Clock, Filter} from 'lucide-react';
import { FaSortAmountDown } from "react-icons/fa";
import { BiCategory } from "react-icons/bi";
import { FaFreeCodeCamp } from "react-icons/fa6";
import { LiaBirthdayCakeSolid } from "react-icons/lia";
import { GiPartyPopper } from "react-icons/gi";
import CardSection from '../CardSection';
import { FaCrown } from "react-icons/fa";
import { Link } from "react-router-dom";
import { GiBigDiamondRing } from "react-icons/gi";
import { FaRupeeSign } from "react-icons/fa";

function Card({ pricing }) {
  return (
    <Link to="/update_editor">
      <motion.div
        className="p-4 bg-white shadow-md rounded-lg text-center h-[440px] cursor-pointer"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="h-[340px] browse_image_card_3 mt-4 relative group">
          {pricing !== "Free" && (
            <div className="absolute flex items-center justify-start w-[40px] h-[40px] bg-blue-500 text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out group-hover:w-[120px] px-2">
              <FaCrown className="text-white text-[24px] flex-shrink-0" />
              <span className="ml-2 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Premium
              </span>
            </div>
          )}
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-[20px] text-pink-600 font-bold">Lovique</div>
        </div>
      </motion.div>
    </Link>
  );
}

const allTemplates = [
  { id: 1, pricing: "Paid" },
  { id: 2, pricing: "Paid" },
  { id: 3, pricing: "Free" },
  { id: 4, pricing: "Paid" },
  { id: 5, pricing: "Free" },
  { id: 6, pricing: "Paid" },
  { id: 7, pricing: "Paid" },
  { id: 8, pricing: "Free" },
  { id: 9, pricing: "Free" },
  { id: 10, pricing: "Paid" },
  { id: 11, pricing: "Paid" },
  { id: 12, pricing: "Paid" },
];

function Review() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [amountCategory, setAmountCategory] = useState('');
  const [category, setCategory] = useState('');
  const [templates, setTemplates] = useState(allTemplates.slice(0, 6));
  const [loading, setLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(6);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading]);

  const handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
      !loading &&
      loadedCount < 12
    ) {
      setLoading(true);
      setTimeout(() => {
        setTemplates((prevTemplates) => {
          const newTemplates = allTemplates.filter(temp =>
            amountCategory ? temp.pricing.toLowerCase() === amountCategory : true
          );
          return newTemplates.slice(0, loadedCount + 6);
        });
        setLoadedCount((prevCount) => Math.min(prevCount + 6, allTemplates.length));
        setLoading(false);
      }, 3000);
    }
  };

  useEffect(() => {
    setTemplates(allTemplates.filter(temp =>
      amountCategory ? temp.pricing.toLowerCase() === amountCategory : true
    ).slice(0, loadedCount));
  }, [amountCategory, loadedCount]);

  function Dropdown({ title, options }) {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <div className="relative w-full lg:w-auto">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-5 py-3 rounded-full text-[12px] font-semibold transition-all duration-300 bg-pink-100 text-pink-600 shadow-md hover:bg-pink-50"
        >
          {title}<span className='text-pink-500'> ▼</span>
        </button>
        {isOpen && (
          <div className="absolute top-12 left-0 w-full bg-white shadow-lg rounded-lg z-10">
            {options.map((option) => (
              <button
                key={option.id}
                className="w-full px-5 py-3 text-left hover:bg-pink-100 transition-all duration-300"
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                {option.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const categories = [
    { id: 'hot', name: 'Hot', icon: <Flame className="w-6 h-6" /> },
    { id: 'popular', name: 'Popular', icon: <TrendingUp className="w-6 h-6" /> },
    { id: 'latest', name: 'Latest', icon: <Clock className="w-6 h-6" /> },
  ];
  const amountCategories = [
    { id: 'free', name: 'Free', icon: <FaFreeCodeCamp className="w-6 h-6" /> },
    { id: 'paid', name: 'Paid', icon: <FaRupeeSign className="w-5 h-5" /> },
  ];
  const eventCategories = [
    { id: 'birthday', name: 'Birthday', icon: <LiaBirthdayCakeSolid className="w-6 h-6" /> },
    { id: 'wedding', name: 'Wedding', icon: <GiBigDiamondRing className="w-6 h-6" /> },
    { id: 'party', name: 'Party', icon: <GiPartyPopper className="w-6 h-6" /> },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-pink-50 to-white ">
      {/* Responsive Sidebar */}
      <div className="lg:w-72 bg-white shadow-2xl p-6 border-r-2 border-pink-200 flex lg:flex-col overflow-x-auto lg:overflow-visible">
        <div className="hidden lg:flex-col space-x-4 lg:space-x-0 lg:block">
          {/* Filter Section */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Filter className="w-7 h-7 text-pink-600" />
              <h2 className="text-xl font-bold text-pink-600 tracking-wide ">Filter</h2>
            </div>

            {/* All Category */}
            <button
              onClick={() => setAmountCategory('')}
              className={`w-full text-left px-5 py-3 rounded-full font-semibold transition-all duration-300 ${
                  amountCategory === '' // Fixed the condition
                  ? 'bg-pink-100 text-pink-700 shadow-lg'
                  : 'text-gray-800 hover:bg-pink-50 hover:shadow-md'
              }`}
            >
              All
            </button>
            {/* Category List */}
            <div className="space-y-3 mt-4">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-full font-semibold transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-pink-100 text-pink-700 shadow-lg'
                      : 'text-gray-800 hover:bg-pink-50 hover:shadow-md'
                  }`}
                >
                  <span className="text-pink-600">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Amount Section */}
          <div>
            <div className="flex items-center gap-3 mb-6 mt-6">
              <FaSortAmountDown className="w-7 h-7 text-pink-600" />
              <h2 className="text-xl font-bold text-pink-600 tracking-wide">Amount</h2>
            </div>
            <div className="space-y-3">
              {amountCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setAmountCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-full font-semibold transition-all duration-300 ${
                    amountCategory === cat.id
                      ? 'bg-pink-100 text-pink-700 shadow-lg'
                      : 'text-gray-800 hover:bg-pink-50 hover:shadow-md'
                  }`}
                >
                  <span className="text-pink-600">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
          {/* Event Category Section */}
          <div>
            <div className="flex items-center gap-3 mb-6 mt-6">
              <BiCategory className="w-7 h-7 text-pink-600" />
              <h2 className="text-xl font-bold text-pink-600 tracking-wide">Category</h2>
            </div>
            <div className="space-y-3">
              {eventCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-full font-semibold transition-all duration-300 ${
                    category === cat.id
                      ? 'bg-pink-100 text-pink-700 shadow-lg'
                      : 'text-gray-800 hover:bg-pink-50 hover:shadow-md'
                  }`}
                >
                  <span className="text-pink-600">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="lg:hidden flex justify-evenly items-start w-full h-[10vh] space-x-4 bg-white ps-2 pe-2">
        <Dropdown title="Filter" options={categories} />
        <Dropdown title="Amount" options={amountCategories} />
        <Dropdown title="Category" options={eventCategories} />
      </div>
      {/* Main Content Area */}
      <div className="flex-1 p-8 bg-white shadow-2xl">
        {/* Card Section */}
        <div className="rounded-2xl py-8">
          <CardSection cards={templates.map((temp) => <Card key={temp.id} pricing={temp.pricing} />)} />
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 py-8">
              {Array(6).fill(0).map((_, index) => ( // Changed from 3 to 6
                <motion.div 
                  key={index} 
                  className="w-full max-w-[450px] h-[440px] bg-gray-200 animate-pulse rounded-lg shadow-md mx-auto" 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ duration: 0.5 }} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Review;