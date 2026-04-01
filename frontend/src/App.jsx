import { useState } from 'react'
import Sidebar from './components/Sidebar'
import HomePage from './pages/HomePage'
import CampaignsPage from './pages/CampaignsPage'
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

  const activeNav = nav === 'campaign-detail' ? 'campaigns' : nav

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a' }}>
      <Sidebar active={activeNav} onNav={goTo} />
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center' }}>
        {nav === 'home'      && <HomePage    onViewCampaign={viewCampaign} onImport={() => goTo('import')} />}
        {nav === 'campaigns' && <CampaignsPage onView={viewCampaign} onImport={() => goTo('import')} />}
        {nav === 'import'    && <ImportPage  onDone={() => goTo('campaigns')} />}
        {nav === 'contacts'  && <ContactsPage />}
        {nav === 'campaign-detail' && selectedCampaign && (
          <CampaignDetailPage campaign={selectedCampaign} onBack={() => goTo('campaigns')} />
        )}
      </main>
    </div>
  )
}
