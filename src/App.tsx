import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Header from './Components/layout/Header'
import Footer from './Components/layout/Footer'
import AppHeader from './Components/layout/AppHeader'
import PrivateRoute from './Components/PrivateRoute'
import HomePage from './pages/HomePage/HomePage'
import SobrePage from './pages/SobrePage/SobrePage'
import OngPage from './pages/OngPage/OngPage'
import FaqPage from './pages/FaqPage/FaqPage'
import IntegrantesListPage from './pages/IntegrantesListPage/IntegrantesListPage'
import IntegranteDetailPage from './pages/IntegranteDetailPage/IntegranteDetailPage'
import ContatoPage from './pages/ContatoPage/ContatoPage'
import LoginPage from './pages/LoginPage/LoginPage'
import CadastroPage from './pages/CadastroPage/CadastroPage'
import DashboardPage from './pages/DashboardPage/DashboardPage'
import PerfilPage from './pages/PerfilPage/PerfilPage'
import ProntuarioPage from './pages/ProntuarioPage/ProntuarioPage'
import CasosPage from './pages/CasosPage/CasosPage'
import RelatoriosPage from './pages/RelatoriosPage/RelatoriosPage'
import IntegracoesPage from './pages/IntegracoesPage/IntegracoesPage'
import DentistaAreaPage from './pages/DentistaAreaPage/DentistaAreaPage'
import BeneficiarioAreaPage from './pages/BeneficiarioAreaPage/BeneficiarioAreaPage'
import PatrocinadorAreaPage from './pages/PatrocinadorAreaPage/PatrocinadorAreaPage'

function PublicLayout() {
  return (
    <>
      <Header />
      <main className="max-w-[1200px] mx-auto px-4 pb-12">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

function PrivateLayout() {
  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <AppHeader />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/sobre" element={<SobrePage />} />
            <Route path="/tdb" element={<OngPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/integrantes" element={<IntegrantesListPage />} />
            <Route path="/integrantes/:id" element={<IntegranteDetailPage />} />
            <Route path="/contato" element={<ContatoPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/cadastro" element={<CadastroPage />} />
          </Route>

          <Route element={<PrivateRoute />}>
            <Route element={<PrivateLayout />}>
              {/* Área do Funcionário (Integrante) */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/casos" element={<CasosPage />} />
              <Route path="/prontuario" element={<ProntuarioPage />} />
              <Route path="/relatorios" element={<RelatoriosPage />} />
              <Route path="/integracoes" element={<IntegracoesPage />} />

              {/* Área do Dentista */}
              <Route path="/area-dentista" element={<DentistaAreaPage />} />

              {/* Área do Beneficiário */}
              <Route path="/area-beneficiario" element={<BeneficiarioAreaPage />} />

              {/* Área do Patrocinador */}
              <Route path="/area-patrocinador" element={<PatrocinadorAreaPage />} />

              {/* Compartilhado entre todos */}
              <Route path="/perfil" element={<PerfilPage />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
