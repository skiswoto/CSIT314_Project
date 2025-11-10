import { supabase } from '../libs/supabase';
import { getAllListings } from '../services/listings';

jest.mock('../libs/supabase', () => ({
  supabase: { from: jest.fn() },
}));

test('calls supabase.from("Listings") when invoked', async () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
  });

  await getAllListings();

  expect(supabase.from).toHaveBeenCalledWith('Listings');
  expect(mockSelect).toHaveBeenCalledWith('*');
  expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
});

test('applies status filter when provided', async () => {
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  const mockEq = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
  });

  await getAllListings({ locations: [], serviceTypes: [], urgencies: [], dateRange: { start: null, end: null }, status: 'available' });

  expect(mockEq).toHaveBeenCalledWith('status', 'available');
});

test('applies location filter correctly', async () => {
  const mockOr = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
    or: mockOr,
  });

  await getAllListings({
    locations: ['East', 'West'],
    serviceTypes: [],
    urgencies: [],
    dateRange: { start: null, end: null },
  });

  expect(mockOr).toHaveBeenCalledWith(expect.stringContaining('street_address.ilike.%East%'));
  expect(mockOr).toHaveBeenCalledWith(expect.stringContaining('street_address.ilike.%West%'));
});

test('applies service type filter correctly', async () => {
  const mockIn = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
    in: mockIn,
  });

  await getAllListings({
    locations: [],
    serviceTypes: ['Cleaning', 'Teaching'],
    urgencies: [],
    dateRange: { start: null, end: null },
  });

  expect(mockIn).toHaveBeenCalledWith('category', ['Cleaning', 'Teaching']);
});

test('applies urgency filter correctly', async () => {
  const mockIn = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
    in: mockIn,
  });

  await getAllListings({
    locations: [],
    serviceTypes: [],
    urgencies: ['High'],
    dateRange: { start: null, end: null },
  });

  expect(mockIn).toHaveBeenCalledWith('urgency', ['High']);
});

test('applies date range filters correctly', async () => {
  const mockGte = jest.fn().mockReturnThis();
  const mockLte = jest.fn().mockReturnThis();
  const mockSelect = jest.fn().mockReturnThis();
  const mockOrder = jest.fn().mockReturnThis();
  (supabase.from as jest.Mock).mockReturnValue({
    select: mockSelect,
    order: mockOrder,
    gte: mockGte,
    lte: mockLte,
  });

  await getAllListings({
    locations: [],
    serviceTypes: [],
    urgencies: [],
    dateRange: { start: new Date('2025-11-01'), end: new Date('2025-11-05') },
  });

  expect(mockGte).toHaveBeenCalledWith('listing_date', '2025-11-01');
  expect(mockLte).toHaveBeenCalledWith('listing_date', '2025-11-05');
});

