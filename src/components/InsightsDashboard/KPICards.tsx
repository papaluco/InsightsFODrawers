import React from 'react';
import { MEQsCard } from './Cards/MEQsCard';
import { SupperCard } from './Cards/SupperCard';
import { RevenueCard } from './Cards/RevenueCard';
import { BreakfastCard } from './Cards/BreakfastCard';
import { LunchCard } from './Cards/LunchCard';
import { MPLHCard } from './Cards/MPLHCard';
import { SnackCard } from './Cards/SnackCard';
import { WasteCard } from './Cards/WasteCard';
import { MealsCard } from './Cards/MealsCard';
import { EcoDisCard } from './Cards/EcoDisCard';
import { InventoryValueCard } from './Cards/InventoryValueCard';
import { InventoryTurnoverCard } from './Cards/InventoryTurnoverCard';
import { PhysicalInventoryCard } from './Cards/PhysicalInventoryCard';
import { PNACard } from './Cards/PNACard';
import { ENPCard } from './Cards/ENPCard';

interface KPICardsProps {
  actualMPLH: number;
  targetMPLH: number;
  actualPNA: number;
  targetPNA: number;
  districtENPActual: number;
  districtENPBenchmark: number;
  onOpenMPLH: () => void;
  onOpenPNA: () => void;
  onOpenENP: () => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  actualMPLH, targetMPLH, actualPNA, targetPNA,
  districtENPActual, districtENPBenchmark,
  onOpenMPLH, onOpenPNA, onOpenENP
}) => {
  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      <MPLHCard actualMPLH={actualMPLH} targetMPLH={targetMPLH} onClick={onOpenMPLH} />
      <PNACard actualPNA={actualPNA} targetPNA={targetPNA} onClick={onOpenPNA} />
      <ENPCard actualENP={districtENPActual} benchmarkENP={districtENPBenchmark} onClick={onOpenENP} />
      <WasteCard />
      
      <BreakfastCard />
      <LunchCard />
      <SupperCard />
      <SnackCard />
      
      <MEQsCard />
      <MealsCard />
      <EcoDisCard />
      <RevenueCard />

      <InventoryValueCard />
      <InventoryTurnoverCard />
      <PhysicalInventoryCard />
      
    </div>
  );
};