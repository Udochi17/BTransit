import React from "react";

import { motion } from 'Framer-motion'
const Search = () => {
    return (
        <motion.div
            className="w-full bg-neutral-50/20 brder-2 border-neutral-300 shadow-lg rounded-xl p"
            initial={{ opacity: 0, y: -800 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -800 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
        >
            <div className="w-full flex items-center gap-5 justify-between">
                {/* from and to input section */}
                <div className="w flex items-center gap-5 relative"></div>
            {/* {from} */}
                <div className="w-1/2 h-14 border border-neutral-300 bg-white/70 text-base text-neutral-700 font-meduim px-5 flex items-center gap-x-1 rounded-lg">
                 {/* to */}

                  {/* Exchange button */}
                  <button className="absolute w-11 h-6 top-1/2 left-1/2 -translate-y-1/2 rounded-full flex items-center -justify-center bg-primary">
                    <TbArrowExchange className="w-6 h-6 text-neutral-50 />
                  </button>
                </div>


        {/* date and button section */}
                <div className="flex-1 h-14 flex items-center gap-5"></div>
            </div>
        </motion.div >
    )
}

export default Search