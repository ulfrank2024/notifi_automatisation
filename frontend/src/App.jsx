import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAuth } from './context/AuthContext'
import useIsMobile from './hooks/useIsMobile'
import LoginPage from './pages/LoginPage'
import Sidebar from './components/Sidebar'
import BottomNav from './components/BottomNav'
import MobileHeader from './components/MobileHeader'
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
import SendPage from './pages/SendPage'
import ImportPage from './pages/ImportPage'
import ContactsPage from './pages/ContactsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'

export default function App() {
  const { isAuthenticated, ready } = useAuth()
  const isMobile = useIsMobile()
  const [nav, setNav]              = useState('home')
  const [selectedCampaign, setSelected] = useState(null)
  const [campaigns, setCampaigns]  = useState([])

  // Charger les campagnes une fois connecté (utilisé par SendPage)
  useEffect(() => {
    if (!isAuthenticated) return
    axios.get('/api/campaigns/history').then(r => setCampaigns(r.data)).catch(() => {})
  }, [isAuthenticated])

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
      </div>
    )
  }

  if (!isAuthenticated) return <LoginPage />

  function goTo(page) { setSelected(null); setNav(page) }
  function viewCampaign(campaign) { setSelected(campaign); setNav('campaign-detail') }
  function onImportDone() { axios.get('/api/campaigns/history').then(r => setCampaigns(r.data)); goTo('campaigns') }

  const activeNav = nav === 'campaign-detail' ? 'campaigns' : nav

  const page = (
    <>
      {nav === 'home'      && <HomePage      onViewCampaign={viewCampaign} onImport={() => goTo('import')} />}
      {nav === 'campaigns' && <CampaignsPage onView={viewCampaign} onImport={() => goTo('import')} />}
      {nav === 'send'      && <SendPage      campaigns={campaigns} />}
      {nav === 'import'    && <ImportPage    onDone={onImportDone} />}
      {nav === 'contacts'  && <ContactsPage />}
      {nav === 'campaign-detail' && selectedCampaign && (
        <CampaignDetailPage campaign={selectedCampaign} onBack={() => goTo('campaigns')} />
      )}
    </>
  )

  if (isMobile) {
    return (
      <div style={{ background: '#0a0a0a', minHeight: '100vh' }}>
        <MobileHeader />
        <main style={{ paddingTop: '52px', paddingBottom: '68px', display: 'flex', justifyContent: 'center' }}>
          {page}
        </main>
        <BottomNav active={activeNav} onNav={goTo} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar active={activeNav} onNav={goTo} />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        {page}
      </main>
    </div>
  )
}
