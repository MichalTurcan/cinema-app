import React from 'react';
import About from "../components/About";
import Movies from "../components/Movies";
import Team from "../components/OurTeam";
import Header from '../components/header';





function Home() {
    return (
        <>
            
            <Header />
            <About />
            <Movies />
            <Team />
            
        </>
    );
}

export default Home;