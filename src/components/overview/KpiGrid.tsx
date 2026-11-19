import React from 'react';
import { useSoilSense } from '../../context/SoilSenseContext';
import { KpiCard } from './KpiCard';
import { KpiCardSkeleton } from '../common/Skeleton';
import { SoilParameterKey } from '../../types/thingspeak';

export const KpiGrid: React.FC = () => {
  const { records, latestRecord, isLoading, openParameterModal } = useSoilSense();

  const parameterKeys: SoilParameterKey[] = [
    'moisture',
    'temperature',
    'pH',
    'ec',
    'nitrogen',
    'phosphorus',
    'potassium',
    'batteryVoltage'
  ];

  const previousRecord = records.length > 1 ? records[records.length - 2] : null;

  if (isLoading && records.length === 0) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {parameterKeys.map(k => (
          <KpiCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      {parameterKeys.map(key => (
        <KpiCard
          key={key}
          parameterKey={key}
          latestRecord={latestRecord}
          previousRecord={previousRecord}
          onCardClick={openParameterModal}
        />
      ))}
    </div>
  );
};
