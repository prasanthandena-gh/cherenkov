import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Route, Routes } from 'react-router-dom'
import App from './App'
import Command from './routes/Command'
import Reactors from './routes/Reactors'
import ReactorModel from './routes/ReactorModel'
import Fusion from './routes/Fusion'
import Fission from './routes/Fission'
import Sandbox from './routes/Sandbox'
import Grids from './routes/Grids'
import Carbon from './routes/Carbon'
import Roadmap from './routes/Roadmap'
import Glossary from './routes/Glossary'
import './styles/tokens.css'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index               element={<Command />} />
          <Route path="reactors"     element={<Reactors />} />
          <Route path="reactors/:id" element={<ReactorModel />} />
          <Route path="fusion"       element={<Fusion />} />
          <Route path="fission"      element={<Fission />} />
          <Route path="sandbox"      element={<Sandbox />} />
          <Route path="grids"        element={<Grids />} />
          <Route path="carbon"       element={<Carbon />} />
          <Route path="roadmap"      element={<Roadmap />} />
          <Route path="glossary"     element={<Glossary />} />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>
)
