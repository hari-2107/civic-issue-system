import React, { useEffect, useState } from 'react';
import { useNotifications } from '../context/NotificationContext.js';
import { createComplaint, getCategories } from '../services/complaintService.js';
import type { Category } from '../types/index';
import MapSelector from '../components/MapSelector';
import { ArrowLeft, Send } from 'lucide-react';
import { INDIA_STATES_AND_DISTRICTS, TAMIL_NADU_TALUKS } from '../utils/indiaData.js';

const STATES_OF_INDIA = Object.keys(INDIA_STATES_AND_DISTRICTS).sort();

const getDistrictsForState = (stateName: string): string[] => {
    if (stateName === "None") return ["None"];
    const districts = INDIA_STATES_AND_DISTRICTS[stateName];
    if (districts) {
        return ["None", ...districts];
    }
    return ["None"];
};

const getTaluksForDistrict = (stateName: string, districtName: string): string[] => {
    if (districtName === "None") return ["None"];
    if (stateName === "Tamil Nadu") {
        const taluks = TAMIL_NADU_TALUKS[districtName];
        if (taluks) {
            return ["None", ...taluks];
        }
    }
    if (stateName === "Karnataka" && districtName === "Bengaluru Urban") {
        return ["None", "Bengaluru North", "Bengaluru South", "Bengaluru East"];
    }
    if (stateName === "Maharashtra" && districtName === "Mumbai City") {
        return ["None", "Colaba", "Dharavi", "Bandra"];
    }
    return ["None", `${districtName} Taluk A`, `${districtName} Taluk B`, `${districtName} Taluk C`];
};

const getRevenueDivisionsForTaluk = (stateName: string, districtName: string, talukName: string): string[] => {
    if (talukName === "None") return ["None"];
    if (stateName === "Tamil Nadu" && districtName === "Madurai") {
        if (talukName === "Vadipatti") return ["None", "Vadipatti", "Usilampatti"];
        if (talukName === "Madurai South") return ["None", "Madurai South Division", "Thirumangalam"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Chennai" && talukName === "Mylapore") {
        return ["None", "Mylapore Division"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Coimbatore" && talukName === "Coimbatore North") {
        return ["None", "Coimbatore North Division"];
    }
    if (stateName === "Karnataka" && districtName === "Bengaluru Urban" && talukName === "Bengaluru North") {
        return ["None", "Yelahanka Division"];
    }
    if (stateName === "Tamil Nadu") {
        return ["None", `${talukName} Division`, `${districtName} Division`];
    }
    return ["None", `${talukName} Division 1`, `${talukName} Division 2`];
};

const getFirkasForRevenueDivision = (stateName: string, districtName: string, talukName: string, revDivName: string): string[] => {
    if (revDivName === "None") return ["None"];
    if (stateName === "Tamil Nadu" && districtName === "Madurai" && talukName === "Vadipatti") {
        if (revDivName === "Vadipatti") return ["None", "Alanganallur", "Sholavandan"];
        if (revDivName === "Usilampatti") return ["None", "Melakkal"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Madurai" && talukName === "Madurai South" && revDivName === "Madurai South Division") {
        return ["None", "Thiruparankundram", "Avaniapuram"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Chennai" && talukName === "Mylapore" && revDivName === "Mylapore Division") {
        return ["None", "Adyar", "Velachery"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Coimbatore" && talukName === "Coimbatore North" && revDivName === "Coimbatore North Division") {
        return ["None", "Singanallur", "Vellalore"];
    }
    if (stateName === "Karnataka" && districtName === "Bengaluru Urban" && talukName === "Bengaluru North" && revDivName === "Yelahanka Division") {
        return ["None", "Yelahanka Firka"];
    }
    if (stateName === "Tamil Nadu") {
        const baseName = revDivName.endsWith(" Division") ? revDivName.replace(" Division", "") : revDivName;
        return ["None", `${baseName} Town Firka`, `${baseName} North Firka`, `${baseName} South Firka`];
    }
    return ["None", `${revDivName} Firka Alpha`, `${revDivName} Firka Beta`];
};

const getVillagePanchayatsForFirka = (stateName: string, districtName: string, talukName: string, revDivName: string, firkaName: string): string[] => {
    if (firkaName === "None") return ["None"];
    if (stateName === "Tamil Nadu" && districtName === "Madurai" && talukName === "Vadipatti") {
        if (revDivName === "Vadipatti") {
            if (firkaName === "Alanganallur") return ["None", "Mullipallam", "Thenur", "Mannadimangalam"];
            if (firkaName === "Sholavandan") return ["None", "Kondayampatti", "Mellur Panchayat"];
        }
        if (revDivName === "Usilampatti" && firkaName === "Melakkal") {
            return ["None", "Melakkal Panchayat", "Samanallur"];
        }
    }
    if (stateName === "Tamil Nadu" && districtName === "Madurai" && talukName === "Madurai South" && revDivName === "Madurai South Division") {
        if (firkaName === "Thiruparankundram") return ["None", "Thanakkankulam", "Nilaiyur"];
        if (firkaName === "Avaniapuram") return ["None", "Avaniapuram East", "Avaniapuram West"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Chennai" && talukName === "Mylapore" && revDivName === "Mylapore Division") {
        if (firkaName === "Adyar") return ["None", "Adyar Ward 1", "Adyar Ward 2"];
        if (firkaName === "Velachery") return ["None", "Velachery East", "Velachery West"];
    }
    if (stateName === "Tamil Nadu" && districtName === "Coimbatore" && talukName === "Coimbatore North" && revDivName === "Coimbatore North Division") {
        if (firkaName === "Singanallur") return ["None", "Singanallur Village 1", "Singanallur Village 2"];
        if (firkaName === "Vellalore") return ["None", "Vellalore Hamlet", "Vellalore Old Town"];
    }
    if (stateName === "Karnataka" && districtName === "Bengaluru Urban" && talukName === "Bengaluru North" && revDivName === "Yelahanka Division" && firkaName === "Yelahanka Firka") {
        return ["None", "Yelahanka Village A", "Yelahanka Village B"];
    }
    if (stateName === "Tamil Nadu") {
        return [
            "None",
            `${firkaName} Village Panchayat`,
            `${firkaName} Pudur Panchayat`,
            `${firkaName} Nagar Village`
        ];
    }
    return ["None", `${firkaName} Panchayat X`, `${firkaName} Panchayat Y`];
};

interface ComplaintFormPageProps {
    onNavigate: (page: string) => void;
}

export const ComplaintFormPage: React.FC<ComplaintFormPageProps> = ({ onNavigate }) => {
    const { showToast } = useNotifications();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCats, setLoadingCats] = useState(true);

    // Form Fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const [address, setAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [contactNumber, setContactNumber] = useState('');

    // Coordinates (default India coordinates)
    const [lat, setLat] = useState(20.5937);
    const [lng, setLng] = useState(78.9629);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Administrative divisions options states
    const [state, setState] = useState('None');
    const [district, setDistrict] = useState('None');
    const [taluk, setTaluk] = useState('None');
    const [revenueDivision, setRevenueDivision] = useState('None');
    const [firka, setFirka] = useState('None');
    const [villagePanchayat, setVillagePanchayat] = useState('None');

    const handleStateChange = (val: string) => {
        setState(val);
        setDistrict('None');
        setTaluk('None');
        setRevenueDivision('None');
        setFirka('None');
        setVillagePanchayat('None');
    };

    const handleDistrictChange = (val: string) => {
        setDistrict(val);
        setTaluk('None');
        setRevenueDivision('None');
        setFirka('None');
        setVillagePanchayat('None');
    };

    const handleTalukChange = (val: string) => {
        setTaluk(val);
        setRevenueDivision('None');
        setFirka('None');
        setVillagePanchayat('None');
    };

    const handleRevenueDivisionChange = (val: string) => {
        setRevenueDivision(val);
        setFirka('None');
        setVillagePanchayat('None');
    };

    const handleFirkaChange = (val: string) => {
        setFirka(val);
        setVillagePanchayat('None');
    };

    const stateOptions = ["None", ...STATES_OF_INDIA];
    const districtOptions = getDistrictsForState(state);
    const talukOptions = getTaluksForDistrict(state, district);
    const revenueDivisionOptions = getRevenueDivisionsForTaluk(state, district, taluk);
    const firkaOptions = getFirkasForRevenueDivision(state, district, taluk, revenueDivision);
    const villagePanchayatOptions = getVillagePanchayatsForFirka(state, district, taluk, revenueDivision, firka);

    // Photos selected state
    const [images, setImages] = useState<{ file: File; base64: string }[]>([]);

    useEffect(() => {
        const fetchCats = async () => {
            try {
                const data = await getCategories();
                setCategories(data);
                if (data.length > 0) setCategoryId(String(data[0].id));
            } catch (err) {
                showToast('Failed to load categories.', 'error');
            } finally {
                setLoadingCats(false);
            }
        };
        fetchCats();
    }, [showToast]);

    const handleLocationChange = (selectedLat: number, selectedLng: number) => {
        setLat(selectedLat);
        setLng(selectedLng);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            showToast('You can upload up to 5 photos maximum.', 'warning');
            return;
        }

        files.forEach(file => {
            if (file.size > 25 * 1024 * 1024) {
                showToast(`"${file.name}" exceeds the 25MB limit.`, 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                setImages(prev => [...prev, { file, base64 }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (indexToRem: number) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRem));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !address.trim() || !categoryId || !state || !district || !taluk || !revenueDivision || !firka || !villagePanchayat) {
            showToast('Please fill in all mandatory fields *', 'warning');
            return;
        }

        setIsSubmitting(true);
        try {
            const imageUrls = images.map(img => img.base64);
            await createComplaint({
                title,
                description,
                category_id: Number(categoryId),
                priority,
                address,
                landmark: landmark || undefined,
                latitude: lat,
                longitude: lng,
                contact_number: contactNumber || undefined,
                state,
                district,
                taluk,
                revenue_division: revenueDivision,
                firka,
                village_panchayat: villagePanchayat,
                imageUrls
            });
            showToast('Civic complaint filed successfully and sent to inspection!', 'success');
            onNavigate('dashboard');
        } catch (err: any) {
            const msg = err.response?.data?.error || 'Failed to submit complaint. Check inputs.';
            showToast(msg, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Title block */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                    onClick={() => onNavigate('dashboard')}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '8px' }}
                >
                    <ArrowLeft size={16} /> Back
                </button>
                <div>
                    <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Report a Civic Issue</h2>
                    <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>File issues with road repairs, sewerage, light posts, or water blockages.</p>
                </div>
            </div>

            {/* Main form columns layout */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

                {/* Form panel */}
                <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        ✏️ Issue Particulars
                    </h3>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Subject / Title *</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. Water leak outside central library"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Category *</label>
                            {loadingCats ? (
                                <div className="skeleton skeleton-text" />
                            ) : (
                                <select
                                    className="form-control"
                                    value={categoryId}
                                    onChange={e => setCategoryId(e.target.value)}
                                    disabled={isSubmitting}
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            )}
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Initial Urgency *</label>
                            <select
                                className="form-control"
                                value={priority}
                                onChange={e => setPriority(e.target.value)}
                                disabled={isSubmitting}
                            >
                                <option value="Low">Low (No immediate hazard)</option>
                                <option value="Medium">Medium (Affects daily operations)</option>
                                <option value="High">High (Potential safety issue)</option>
                                <option value="Critical">Critical (Immediate danger)</option>
                            </select>
                        </div>
                    </div>

                    {/* Indian Administrative Hierarchy Selector Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">State *</label>
                            <select
                                className="form-control"
                                value={state}
                                onChange={e => handleStateChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {stateOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">District *</label>
                            <select
                                className="form-control"
                                value={district}
                                onChange={e => handleDistrictChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {districtOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Taluk *</label>
                            <select
                                className="form-control"
                                value={taluk}
                                onChange={e => handleTalukChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {talukOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Revenue Division *</label>
                            <select
                                className="form-control"
                                value={revenueDivision}
                                onChange={e => handleRevenueDivisionChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {revenueDivisionOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Firka *</label>
                            <select
                                className="form-control"
                                value={firka}
                                onChange={e => handleFirkaChange(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {firkaOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label className="form-label">Village Panchayat *</label>
                            <select
                                className="form-control"
                                value={villagePanchayat}
                                onChange={e => setVillagePanchayat(e.target.value)}
                                disabled={isSubmitting}
                            >
                                {villagePanchayatOptions.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Detailed Description *</label>
                        <textarea
                            className="form-control"
                            rows={4}
                            placeholder="Describe the complaint in detail. (e.g. dimensions, how long it has been happening)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Contact Mobile Number</label>
                        <input
                            type="tel"
                            className="form-control"
                            placeholder="e.g. +91 9486346234 (Used for coordinators status check)"
                            value={contactNumber}
                            onChange={e => setContactNumber(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Photo Attachments Pickers */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">{"Attach Photos (max 5, any format, < 25MB each)"}</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input
                                type="file"
                                id="complaint-photo-upload"
                                multiple
                                accept="image/*"
                                onChange={handleFileChange}
                                disabled={isSubmitting || images.length >= 5}
                                style={{ display: 'none' }}
                            />
                            <label
                                htmlFor="complaint-photo-upload"
                                className="btn btn-secondary"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    border: '1px dashed var(--border-color)',
                                    padding: '12px',
                                    cursor: images.length >= 5 ? 'not-allowed' : 'pointer',
                                    opacity: images.length >= 5 ? 0.6 : 1,
                                    borderRadius: '6px'
                                }}
                            >
                                📷 {images.length >= 5 ? 'Max Photos Limit Reached' : 'Click to Upload Images'} ({images.length}/5)
                            </label>

                            {images.length > 0 && (
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                                    {images.map((img, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                position: 'relative',
                                                width: '70px',
                                                height: '70px',
                                                borderRadius: '6px',
                                                border: '1px solid var(--border-color)',
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <img
                                                src={img.base64}
                                                alt={`upload-preview-${idx}`}
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(idx)}
                                                style={{
                                                    position: 'absolute',
                                                    top: '2px',
                                                    right: '2px',
                                                    width: '18px',
                                                    height: '18px',
                                                    borderRadius: '50%',
                                                    background: 'rgba(239, 68, 68, 0.95)',
                                                    color: 'white',
                                                    border: 'none',
                                                    cursor: 'pointer',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    padding: 0
                                                }}
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Form Action buttons */}
                    <div style={{ display: 'flex', gap: '12px', justifySelf: 'flex-end', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="button" className="btn btn-secondary" onClick={() => onNavigate('dashboard')} disabled={isSubmitting}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Filing Issue...' : <><Send size={16} /> File Report</>}
                        </button>
                    </div>
                </form>

                {/* Geospatial Map picker panel */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
                        📍 Address & Geographic Location
                    </h3>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Complete Street Address *</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. 524 central ave, sector 4"
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                        <label className="form-label">Landmark / Room No (Optional)</label>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="e.g. opposite civic fountain park"
                            value={landmark}
                            onChange={e => setLandmark(e.target.value)}
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Map coordinate coordinate feedback tags */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label className="form-label" style={{ marginBottom: 0 }}>
                            Drag Marker / Click Map for Exact Coordinates
                        </label>
                        <MapSelector latitude={lat} longitude={lng} interactive={true} onChange={handleLocationChange} />
                        <div style={{ display: 'flex', gap: '8px', fontSize: '0.78rem', color: 'var(--text-secondary)', alignSelf: 'flex-end' }}>
                            <span>Latitude: <strong>{lat.toFixed(5)}</strong></span>
                            <span>&bull;</span>
                            <span>Longitude: <strong>{lng.toFixed(5)}</strong></span>
                        </div>
                    </div>
                </div>

            </div>

        </div>
    );
};
export default ComplaintFormPage;
