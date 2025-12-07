# AdminMap Modal Improvements - Implementation Guide

## Overview
This guide consolidates the AdminMap modals to match the improved Destinations page design.

## Key Changes Needed

### 1. Modal State Consolidation
Already started - modalState now handles: 'add', 'edit', 'view', 'qr', 'delete'

### 2. Functions to Replace/Update

#### Replace separate modal handlers with unified:
```javascript
const openModal = (mode, destinationData = null) => {
  setModalState({ isOpen: true, mode, data: destinationData });
  if (mode === 'edit' && destinationData) {
    // Load full destination data
    setFormData({...});
    setActiveSection('basic');
  } else if (mode === 'add') {
    resetForm();
    setActiveSection('basic');
  }
};

const closeModal = () => {
  setModalState({ isOpen: false, mode: '', data: null });
  resetForm();
  setActiveSection('basic');
};
```

#### Update button click handlers:
- Change `setShowEditModal(true)` → `openModal('edit', destination)`
- Change `setShowViewModal(true)` → `openModal('view', destination)`
- Change `setShowQRModal(true)` → `openModal('qr', destination)`

### 3. Enhanced renderModalContent Function

The function should handle all modes:
- **'add' / 'edit'**: Show sectioned form (basic, location, images, amenities, hours, qrcode, contact)
- **'view'**: Show formatted destination details with gradient sections
- **'qr'**: Show QR code display
- **'delete'**: Show delete confirmation (already handled by ConfirmModal)

### 4. Single Modal Component (Replace all separate Modal tags)

```jsx
<Modal 
  isOpen={modalState.isOpen} 
  onClose={closeModal}
  titleIcon={getTitleIcon(modalState.mode)}
  title={getModalTitle(modalState.mode)}
  footer={getModalFooter(modalState.mode)}
  size={modalState.mode === 'add' || modalState.mode === 'edit' ? 'xl' : 'md'}
>
  {renderModalContent()}
</Modal>
```

### 5. Helper Functions

```javascript
const getTitleIcon = (mode) => {
  switch(mode) {
    case 'add': return <PlusIcon />;
    case 'edit': return <EditIcon />;
    case 'view': return <EyeIcon />;
    case 'qr': return <QrCodeIcon />;
    default: return null;
  }
};

const getModalTitle = (mode) => {
  switch(mode) {
    case 'add': return 'Add New Destination';
    case 'edit': return 'Edit Destination';
    case 'view': return 'View Destination';
    case 'qr': return 'QR Code';
    default: return '';
  }
};

const getModalFooter = (mode) => {
  if (mode === 'view' || mode === 'qr') {
    return <Button variant="outline" onClick={closeModal}>Close</Button>;
  }
  
  if (mode === 'add' || mode === 'edit') {
    const currentIndex = sections.findIndex(s => s.id === activeSection);
    const isLastSection = currentIndex === sections.length - 1;
    
    return (
      <>
        <Button variant="outline" onClick={closeModal} disabled={saving}>Cancel</Button>
        <Button 
          variant="primary" 
          onClick={handleSave}
          disabled={saving}
          icon={saving ? <SpinnerIcon /> : (isLastSection ? <SaveIcon /> : <NextIcon />)}
        >
          {saving ? 'Saving...' : (isLastSection ? (mode === 'add' ? 'Add Destination' : 'Update Destination') : 'Next')}
        </Button>
      </>
    );
  }
  
  return null;
};
```

### 6. Section Navigation (for add/edit mode)

Match the Destinations page sections:
```javascript
const sections = [
  { id: 'basic', label: 'Basic Info', icon: '📝' },
  { id: 'location', label: 'Location', icon: '📍' },
  { id: 'images', label: 'Images', icon: '📷' },
  { id: 'amenities', label: 'Amenities', icon: '✨' },
  { id: 'hours', label: 'Hours', icon: '🕐' },
  { id: 'qrcode', label: 'QR Code', icon: '📱' },
  { id: 'contact', label: 'Contact', icon: '📞' },
];
```

### 7. Enhanced Form Sections

Each section should have:
- Consistent styling with Destinations
- Proper labels with required indicators (*)
- Input validation
- Helpful placeholders
- GPS button for location section
- Image upload for images section
- Amenity selector for amenities section
- Operating hours editor for hours section

### 8. View Mode Layout

Match Destinations view mode with gradient sections:
- Basic info (teal gradient)
- Location map preview (blue gradient)
- Images gallery (purple gradient)
- Contact info (green gradient)
- Amenities (pink gradient)
- Operating hours (amber gradient)

### 9. Remove Old Modal Components

Delete these separate modal blocks:
- `<Modal isOpen={showAddModal}>...</Modal>`
- `<Modal isOpen={showEditModal}>...</Modal>`
- `<Modal isOpen={showViewModal}>...</Modal>`
- `<Modal isOpen={showQRModal}>...</Modal>`

Replace with single consolidated Modal.

### 10. Update Marker Popup Buttons

Change popup button handlers to use new `openModal`:
```jsx
<button onClick={() => openModal('view', destination)}>View</button>
<button onClick={() => openModal('edit', destination)}>Edit</button>
<button onClick={() => openModal('qr', destination)}>QR Code</button>
```

## Expected Result

After implementation:
✅ Single modal component handles all modes
✅ Consistent UI/UX with Destinations page
✅ Sectioned form with tab navigation
✅ Better form validation
✅ Enhanced visual design
✅ Cleaner code structure
✅ Easier maintenance

## Testing Checklist

- [ ] Add destination from map click
- [ ] Edit existing destination
- [ ] View destination details
- [ ] Generate/view QR code
- [ ] Delete destination (with confirmation)
- [ ] Navigate between form sections
- [ ] Form validation works
- [ ] GPS auto-fill works
- [ ] Image upload works
- [ ] Save/Update functionality
