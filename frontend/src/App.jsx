import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import ImportPage from './pages/ImportPage'
import ContactsPage from './pages/ContactsPage'
import CampaignDetailPage from './pages/CampaignDetailPage'

export default function App() {
  const [nav, setNav]                   = useState('home')
  const [selectedCampaign, setSelected] = useState(null)

  function goTo(page) {
    setSelected(null)
    setNav(page)
  }

  function viewCampaign(campaign) {
    setSelected(campaign)
    setNav('campaign-detail')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar active={nav === 'campaign-detail' ? 'home' : nav} onNav={goTo} />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        {nav === 'home' && (
          <HomePage onViewCampaign={viewCampaign} onImport={() => goTo('import')} />
        )}
        {nav === 'import' && (
          <ImportPage onDone={() => {}} />
        )}
        {nav === 'contacts' && (
          <ContactsPage />
        )}
        {nav === 'campaign-detail' && selectedCampaign && (
          <CampaignDetailPage campaign={selectedCampaign} onBack={() => goTo('home')} />
        )}
      </main>
    </div>
  )
}
