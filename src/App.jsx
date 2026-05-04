import React from "react";

function App() {
    return (
        <>
            <Router>
                 <main className="w-full flex flex-col bg neutral-50 min-h-screen">
                    {/* Navbar */}
                    <Navbar />

                    {/* Routing */}
                    <Routes>
                        <Route path="/" element={<Home/>} />
                        <Route path="/about" element={<About/>} />
    
                    </Routes>
                      {/* Footer */}
                    </main>   
            </Router>
        </>
    )

    export default App
}