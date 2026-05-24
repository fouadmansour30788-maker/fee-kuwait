'use client'

import { useState, useCallback } from 'react'
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'

const PROGRAMME_COLORS: Record<string, string> = {
  'Eco-Schools': '#52B788',
  'Blue Flag':   '#3B9ECC',
  'Green Key':   '#C8A951',
  'LEAF':        '#40916C',
  'YRE':         '#7C3AED',
  'Eco-Campus':  '#1B4332',
}

const SITES = [
  { id: 1,  name: 'Kuwait Model School',       lat: 29.3760, lng: 47.9940, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Capital'    },
  { id: 2,  name: 'Al-Sabah Model School',      lat: 29.3610, lng: 47.9878, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Capital'    },
  { id: 3,  name: 'Hilton Kuwait Resort',        lat: 29.3510, lng: 47.9700, programme: 'Green Key',   status: 'active',   type: 'Business',   governorate: 'Capital'    },
  { id: 4,  name: 'Seasons Hotel',               lat: 29.3680, lng: 47.9850, programme: 'Green Key',   status: 'active',   type: 'Business',   governorate: 'Capital'    },
  { id: 5,  name: 'Young Reporters Kuwait',      lat: 29.3490, lng: 47.9980, programme: 'YRE',         status: 'active',   type: 'School',     governorate: 'Capital'    },
  { id: 6,  name: 'Rumaithiya Secondary',        lat: 29.3364, lng: 48.0848, programme: 'LEAF',        status: 'active',   type: 'School',     governorate: 'Hawalli'    },
  { id: 7,  name: 'Salmiya Park School',         lat: 29.3317, lng: 48.0748, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Hawalli'    },
  { id: 8,  name: 'Gulf Science University',     lat: 29.3206, lng: 48.0748, programme: 'Eco-Campus',  status: 'active',   type: 'University', governorate: 'Hawalli'    },
  { id: 9,  name: 'Al-Faiha School',             lat: 29.3412, lng: 48.0632, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Hawalli'    },
  { id: 10, name: 'Pearl Beach Resort',          lat: 29.0610, lng: 48.1545, programme: 'Blue Flag',   status: 'active',   type: 'Business',   governorate: 'Ahmadi'     },
  { id: 11, name: 'Marina Bay Hotel',            lat: 29.0840, lng: 48.1340, programme: 'Blue Flag',   status: 'active',   type: 'Business',   governorate: 'Ahmadi'     },
  { id: 12, name: 'Ahmadi Secondary School',     lat: 29.0766, lng: 48.0839, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Ahmadi'     },
  { id: 13, name: 'Sabah Al-Ahmad School',       lat: 29.3371, lng: 47.6581, programme: 'LEAF',        status: 'active',   type: 'School',     governorate: 'Jahra'      },
  { id: 14, name: 'Jahra Model School',          lat: 29.3420, lng: 47.6720, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Jahra'      },
  { id: 15, name: 'Al-Noor Primary School',      lat: 29.2773, lng: 47.9591, programme: 'Eco-Schools', status: 'pending',  type: 'School',     governorate: 'Farwaniya'  },
  { id: 16, name: 'Farwaniya Science School',    lat: 29.2640, lng: 47.9620, programme: 'YRE',         status: 'active',   type: 'School',     governorate: 'Farwaniya'  },
  { id: 17, name: 'Mubarak Al-Kabeer School',    lat: 29.2007, lng: 48.0713, programme: 'Eco-Schools', status: 'active',   type: 'School',     governorate: 'Mubarak Al-Kabeer' },
  { id: 18, name: 'Fintas Beach Club',           lat: 29.1380, lng: 48.1120, programme: 'Blue Flag',   status: 'active',   type: 'Business',   governorate: 'Ahmadi'     },
]

const STATUS_COLORS: Record<string, string> = {
  active:  '#059669',
  pending: '#D97706',
  expired: '#DC2626',
}

type Site = typeof SITES[number]

export default function KuwaitMap({ filter }: { filter: string }) {
  const [popup, setPopup] = useState<Site | null>(null)

  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN

  if (!token || token === 'your_mapbox_public_token') {
    return (
      <div className="flex flex-col items-center justify-center h-full rounded-2xl border-2 border-dashed" style={{ borderColor: '#CBD5E1', background: '#F8FAFC' }}>
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: '#EDE9FE' }}>
            <svg className="w-7 h-7" style={{ color: '#7C3AED' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="font-bold text-sm mb-1" style={{ color: '#1E293B' }}>Mapbox token not configured</p>
          <p className="text-xs leading-relaxed" style={{ color: '#64748B' }}>
            Add your Mapbox public token to <code className="bg-slate-100 px-1 rounded">.env.local</code> as{' '}
            <code className="bg-slate-100 px-1 rounded">NEXT_PUBLIC_MAPBOX_TOKEN</code>
          </p>
        </div>
      </div>
    )
  }

  const visible = filter === 'all' ? SITES : SITES.filter(s => s.programme === filter)

  return (
    <Map
      mapboxAccessToken={token}
      initialViewState={{ longitude: 47.85, latitude: 29.28, zoom: 9.2 }}
      style={{ width: '100%', height: '100%', borderRadius: 16 }}
      mapStyle="mapbox://styles/mapbox/light-v11"
      onClick={() => setPopup(null)}
    >
      <NavigationControl position="top-right" />
      <FullscreenControl position="top-right" />

      {visible.map(site => (
        <Marker
          key={site.id}
          longitude={site.lng}
          latitude={site.lat}
          anchor="center"
          onClick={(e: { originalEvent: { stopPropagation: () => void } }) => { e.originalEvent.stopPropagation(); setPopup(site) }}
        >
          <div
            className="cursor-pointer transition-transform hover:scale-125"
            title={site.name}
          >
            <div
              className="w-4 h-4 rounded-full border-2 border-white shadow-md"
              style={{
                background: PROGRAMME_COLORS[site.programme] ?? '#64748B',
                boxShadow: `0 0 0 3px ${PROGRAMME_COLORS[site.programme] ?? '#64748B'}30`,
              }}
            />
          </div>
        </Marker>
      ))}

      {popup && (
        <Popup
          longitude={popup.lng}
          latitude={popup.lat}
          anchor="bottom"
          offset={14}
          closeButton={false}
          onClose={() => setPopup(null)}
          style={{ padding: 0 }}
        >
          <div className="p-3 min-w-[180px]">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: PROGRAMME_COLORS[popup.programme] }} />
              <p className="font-bold text-xs leading-tight" style={{ color: '#0F172A' }}>{popup.name}</p>
            </div>
            <div className="space-y-0.5 text-[11px]" style={{ color: '#64748B' }}>
              <p>{popup.programme}</p>
              <p>{popup.type} · {popup.governorate}</p>
              <span
                className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1"
                style={{ background: `${STATUS_COLORS[popup.status]}18`, color: STATUS_COLORS[popup.status] }}
              >
                {popup.status.charAt(0).toUpperCase() + popup.status.slice(1)}
              </span>
            </div>
          </div>
        </Popup>
      )}
    </Map>
  )
}
