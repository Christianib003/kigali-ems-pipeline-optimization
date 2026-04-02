import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Kigali EMS Frontend Integration Tests', () => {

  beforeEach(() => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /I Acknowledge and Accept/i }));
  });

  const filterTests = [
    { name: 'Severity 1', select: 'Severity: 1' },
    { name: 'Severity 3', select: 'Severity: 3' },
    { name: 'Severity 5', select: 'Severity: 5' },
    { name: 'Status PENDING', select: 'Status: PENDING' },
    { name: 'Status CLAIMED', select: 'Status: CLAIMED' }
  ];

  filterTests.forEach((scenario, index) => {
    test(`Integration ${index + 1}: Selecting ${scenario.name} updates table state without crashing`, () => {
      const selects = screen.getAllByRole('combobox');
      
      const targetDropdown = scenario.name.includes('Severity') ? selects[0] : selects[1];

      fireEvent.change(targetDropdown, { target: { value: scenario.select.split(': ')[1] } });
      
      expect(screen.getByText(/No incidents match your current filters/i)).toBeInTheDocument();
    });
  });

  const viewScenarios = [
    { tab: 'Live Operations', heading: 'Selected Incident' },
    { tab: 'Incidents', heading: 'Incident Details' },
    { tab: 'Fleet', heading: 'Status Distribution' },
    { tab: 'Hospitals', heading: 'Hospital Detail' },
    { tab: 'Analytics', heading: 'Performance Visualizations' }
  ];

  viewScenarios.forEach((scenario, index) => {
    test(`Integration ${index + 6}: ${scenario.tab} successfully mounts its secondary detail pane`, () => {
      fireEvent.click(screen.getAllByText(scenario.tab)[0]);
      
      const detailHeading = screen.getByRole('heading', { name: new RegExp(scenario.heading, 'i') });
      expect(detailHeading).toBeInTheDocument();
    });
  });

});