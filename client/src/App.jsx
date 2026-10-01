import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Login from './Pages/Login'
import Home from './Pages/Home'

const App = () => {
  return (
    <div>

      {/* routes */}

      <Routes>
        <Route path='/' element={<Home />}></Route>

        {/* Auth pages no navbar */}
        <Route path='/login' element={<Login />}></Route>

      </Routes>

    </div>
  )
}

export default App