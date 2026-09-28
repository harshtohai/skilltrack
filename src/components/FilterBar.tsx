import React, { useEffect, useState } from 'react';
import { FilterParams, District, Provider } from '../types.ts';
import { Filter, RotateCcw, ChevronDown } from 'lucide-react';

interface Props {
  filters: FilterParams;
  onChange: (filters: FilterParams) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<Props> = ({ filters, onChange, onReset }) => {
  const [districts, setDistricts] = useState<District[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetch('/api/analytics/districts')
      .then((res) => res.json())
      .then((data) => setDistricts(data))
      .catch((err) => console.error(err));

    fetch('/api/analytics/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data.map((x: any) => x.provider)))
      .catch((err) => console.error(err));
  }, []);

  const handleChange = (key: keyof FilterParams, val: any) => {
    onChange({
      ...filters,
      [key]: val === 'all' || val === '' ? undefined : val
    });
  };

  const hasActiveFilters =
    filters.district ||
    filters.sector ||
    filters.provider ||
    filters.gender ||
    filters.category ||
    filters.year ||
    filters.includeUnverified;

  return (
    <div className="bg-white rounded-[20px] border border-[#E2E2DE] p-4 shadow-[0_3px_14px_rgba(35,38,45,0.05)] transition-colors duration-200 w-full min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E2E2DE]">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#303030]" />
          <span className="text-xs font-medium text-[#303030] uppercase tracking-wider">
            Cohort & Demographic Filters
          </span>
          {hasActiveFilters && (
            <span className="text-[10px] bg-[#FFF0A8] text-[#665400] font-medium px-2.5 py-0.5 rounded-full">
              Filtered View
            </span>
          )}
        </div>

        {/* Include unverified toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-normal text-[#74767D] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.includeUnverified || false}
              onChange={(e) => handleChange('includeUnverified', e.target.checked)}
              className="rounded accent-[#303030] w-3.5 h-3.5"
            />
            <span>Include Unverified (Low Confidence)</span>
          </label>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs text-[#74767D] hover:text-[#303030] px-2.5 py-1 rounded-full border border-[#E2E2DE] hover:bg-[#F1F1EE] transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter controls row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-3">
        {/* District Filter */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            District
          </label>
          <select
            value={filters.district || 'all'}
            onChange={(e) => handleChange('district', e.target.value)}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors"
          >
            <option value="all">All 36 Districts</option>
            {districts.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.region})
              </option>
            ))}
          </select>
        </div>

        {/* Sector Filter */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            Sector
          </label>
          <select
            value={filters.sector || 'all'}
            onChange={(e) => handleChange('sector', e.target.value)}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors"
          >
            <option value="all">All Sectors</option>
            <option value="Automotive">Automotive</option>
            <option value="IT-ITeS">IT & Tech</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Electronics">Electronics</option>
            <option value="Apparel">Textiles & Apparel</option>
            <option value="Logistics">Logistics & Supply</option>
            <option value="Green Energy">Renewable Energy</option>
          </select>
        </div>

        {/* Training Institute Filter */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            Institute
          </label>
          <select
            value={filters.provider || 'all'}
            onChange={(e) => handleChange('provider', e.target.value)}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors truncate"
          >
            <option value="all">All Institutes</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            Gender
          </label>
          <select
            value={filters.gender || 'all'}
            onChange={(e) => handleChange('gender', e.target.value)}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors"
          >
            <option value="all">All Genders</option>
            <option value="Female">Female</option>
            <option value="Male">Male</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Social Category Filter */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            Category
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleChange('category', e.target.value)}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors"
          >
            <option value="all">All Categories</option>
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        {/* Cohort Year */}
        <div>
          <label className="block text-[10px] uppercase font-medium text-[#74767D] mb-1">
            Cohort Year
          </label>
          <select
            value={filters.year || 'all'}
            onChange={(e) => handleChange('year', e.target.value === 'all' ? undefined : Number(e.target.value))}
            className="w-full text-xs font-normal bg-[#F1F1EE] text-[#303030] border border-[#E2E2DE] rounded-full px-3 py-1.5 focus:outline-hidden focus:border-[#303030] transition-colors"
          >
            <option value="all">All Cohorts</option>
            <option value="2024">2024 (Active)</option>
            <option value="2023">2023 (12m Follow-up)</option>
            <option value="2022">2022 (Historical)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
