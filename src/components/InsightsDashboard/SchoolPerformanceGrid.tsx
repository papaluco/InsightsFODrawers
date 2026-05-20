import React, { useState, useMemo, useRef } from 'react';
import { SchoolieIcon, ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon, ChevronRightIcon, SearchIcon } from '../Common/Icons';
import { CopyMenu } from '../Common/CopyMenu';
import { toBlob } from 'html-to-image';

interface SchoolPerformanceData {
  school: string;
  ecoDis: string;
  meals: number;
  meqs: number;
  breakfast: string;
  lunch: string;
  snack: string;
  supper: string;
  revenue: string;
  waste: string;
  inventoryValue: string;
  inventoryTurnover: string;
  physicalInventoryDiscrepancy: string;
  mplh: string;
  pna: string; // Added PNA
  enp: string; // Added ENP
}

const PERFORMANCE_DATA: SchoolPerformanceData[] = [
  // PAGE 1
  { school: "Andria High School_tier 1 low", ecoDis: "15%", meals: 248, meqs: 300, breakfast: "85%", lunch: "85%", snack: "115%", supper: "169%", revenue: "$1,819.69", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.5%", enp: "$1,450.00" },
  { school: "Arbutus Elementary School", ecoDis: "1%", meals: 5713, meqs: 4655, breakfast: "68%", lunch: "56%", snack: "77%", supper: "93%", revenue: "$35,164.56", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.2%", enp: "$28,400.00" },
  { school: "Arlon Middle School_childcare -at risk", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Bayshore Gardens High School", ecoDis: "0%", meals: 6100, meqs: 4399, breakfast: "82%", lunch: "55%", snack: "129%", supper: "70%", revenue: "$32,971.27", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.1%", enp: "$22,150.00" },
  { school: "Beringen Elementary School", ecoDis: "0%", meals: 228, meqs: 201, breakfast: "100%", lunch: "100%", snack: "93%", supper: "120%", revenue: "$1,301.12", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.0%", enp: "$1,100.00" },
  { school: "BLUEFIELD ELEMENTRY SCHOOL_child care", ecoDis: "30%", meals: 2342, meqs: 2875, breakfast: "33%", lunch: "30%", snack: "159%", supper: "52%", revenue: "$14,371.97", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.8%", enp: "$12,400.00" },
  { school: "BLUEFIELD HIGH SCHOOL_tier II mixed", ecoDis: "33%", meals: 423, meqs: 865, breakfast: "267%", lunch: "233%", snack: "400%", supper: "83%", revenue: "$3,912.30", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.5%", enp: "$3,200.00" },
  { school: "BLUEFILED MIDDLE SCHOOL", ecoDis: "50%", meals: 208, meqs: 235, breakfast: "70%", lunch: "90%", snack: "100%", supper: "120%", revenue: "$1,255.29", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.2%", enp: "$950.00" },
  { school: "Cabadbaran High School", ecoDis: "14%", meals: 1305, meqs: 1056, breakfast: "101%", lunch: "101%", snack: "101%", supper: "101%", revenue: "$7,059.66", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.4%", enp: "$6,100.00" },
  { school: "CENTRAL OFFICE", ecoDis: "67%", meals: 0, meqs: 2, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$595.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$500.00" },
  // PAGE 2
  { school: "Chacao Elementary School", ecoDis: "0%", meals: 931, meqs: 896, breakfast: "77%", lunch: "114%", snack: "102%", supper: "102%", revenue: "$6,122.07", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.1%", enp: "$5,400.00" },
  { school: "Cheria Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Chios Elementary School_tier II high", ecoDis: "0%", meals: 2, meqs: 2, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$16.21", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.1%", enp: "$10.00" },
  { school: "Corfu Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Cotoca Middle School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Dammam Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Gaur Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "Hoensbroek High School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
  { school: "King of Prussia Middle School", ecoDis: "0%", meals: 3105, meqs: 2543, breakfast: "102%", lunch: "103%", snack: "153%", supper: "153%", revenue: "$17,111.69", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.2%", enp: "$14,200.00" },
  { school: "Kula Elementary School", ecoDis: "0%", meals: 0, meqs: 0, breakfast: "0%", lunch: "0%", snack: "0%", supper: "0%", revenue: "$0.00", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "0.0%", enp: "$0.00" },
    { school: "Lakeside Elementary School", ecoDis: "12%", meals: 1845, meqs: 1620, breakfast: "91%", lunch: "88%", snack: "105%", supper: "97%", revenue: "$11,245.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.3%", enp: "$9,800.00" },
  { school: "Maple Ridge High School", ecoDis: "18%", meals: 5220, meqs: 4765, breakfast: "78%", lunch: "81%", snack: "132%", supper: "91%", revenue: "$31,554.22", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.8%", enp: "$26,400.00" },
  { school: "North Valley Middle School", ecoDis: "22%", meals: 2789, meqs: 2401, breakfast: "84%", lunch: "79%", snack: "124%", supper: "101%", revenue: "$16,987.14", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.7%", enp: "$13,900.00" },
  { school: "Oakmont Elementary School", ecoDis: "7%", meals: 1490, meqs: 1322, breakfast: "88%", lunch: "92%", snack: "97%", supper: "85%", revenue: "$8,754.91", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.9%", enp: "$7,600.00" },
  { school: "Pinecrest High School", ecoDis: "30%", meals: 6488, meqs: 5900, breakfast: "95%", lunch: "99%", snack: "147%", supper: "110%", revenue: "$39,812.30", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.2%", enp: "$33,500.00" },
  { school: "Riverbend Elementary School", ecoDis: "11%", meals: 1250, meqs: 1098, breakfast: "72%", lunch: "84%", snack: "101%", supper: "89%", revenue: "$7,102.45", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.8%", enp: "$6,000.00" },
  { school: "Silver Creek Middle School", ecoDis: "16%", meals: 3344, meqs: 2988, breakfast: "86%", lunch: "90%", snack: "133%", supper: "108%", revenue: "$20,155.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.5%", enp: "$17,100.00" },
  { school: "Southgate Elementary School", ecoDis: "5%", meals: 998, meqs: 887, breakfast: "69%", lunch: "74%", snack: "93%", supper: "81%", revenue: "$5,765.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.4%", enp: "$4,900.00" },
  { school: "Summit View High School", ecoDis: "25%", meals: 7102, meqs: 6450, breakfast: "104%", lunch: "97%", snack: "162%", supper: "123%", revenue: "$44,985.67", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.1%", enp: "$37,800.00" },
  { school: "Westbrook Elementary School", ecoDis: "9%", meals: 1678, meqs: 1430, breakfast: "81%", lunch: "87%", snack: "111%", supper: "92%", revenue: "$10,245.16", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.9%", enp: "$8,700.00" },

  { school: "Cedar Grove Middle School", ecoDis: "14%", meals: 2890, meqs: 2550, breakfast: "79%", lunch: "85%", snack: "128%", supper: "103%", revenue: "$17,820.10", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.0%", enp: "$15,000.00" },
  { school: "Brighton Elementary School", ecoDis: "6%", meals: 1180, meqs: 1032, breakfast: "74%", lunch: "80%", snack: "94%", supper: "86%", revenue: "$6,988.50", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.5%", enp: "$5,900.00" },
  { school: "Elmwood High School", ecoDis: "28%", meals: 6022, meqs: 5488, breakfast: "96%", lunch: "94%", snack: "151%", supper: "117%", revenue: "$36,998.40", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.9%", enp: "$31,200.00" },
  { school: "Forest Hill Elementary School", ecoDis: "10%", meals: 1420, meqs: 1215, breakfast: "83%", lunch: "89%", snack: "102%", supper: "90%", revenue: "$8,322.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.4%", enp: "$7,100.00" },
  { school: "Grandview Middle School", ecoDis: "19%", meals: 3550, meqs: 3101, breakfast: "92%", lunch: "87%", snack: "138%", supper: "112%", revenue: "$21,654.91", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.1%", enp: "$18,400.00" },
  { school: "Harbor Point High School", ecoDis: "21%", meals: 5755, meqs: 5100, breakfast: "89%", lunch: "93%", snack: "142%", supper: "105%", revenue: "$34,765.33", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.4%", enp: "$29,100.00" },
  { school: "Ironwood Elementary School", ecoDis: "8%", meals: 1325, meqs: 1188, breakfast: "76%", lunch: "82%", snack: "99%", supper: "88%", revenue: "$7,854.62", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.9%", enp: "$6,700.00" },
  { school: "Juniper Ridge Middle School", ecoDis: "17%", meals: 3012, meqs: 2699, breakfast: "85%", lunch: "88%", snack: "126%", supper: "107%", revenue: "$18,445.29", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.7%", enp: "$15,800.00" },
  { school: "Kingsway High School", ecoDis: "27%", meals: 6890, meqs: 6201, breakfast: "101%", lunch: "98%", snack: "158%", supper: "121%", revenue: "$42,510.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.7%", enp: "$35,900.00" },
  { school: "Liberty Elementary School", ecoDis: "13%", meals: 1550, meqs: 1360, breakfast: "87%", lunch: "90%", snack: "108%", supper: "95%", revenue: "$9,455.73", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.7%", enp: "$8,200.00" },
  { school: "Meadowbrook Elementary School", ecoDis: "9%", meals: 1388, meqs: 1201, breakfast: "82%", lunch: "86%", snack: "104%", supper: "91%", revenue: "$8,145.29", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.8%", enp: "$6,900.00" },
  { school: "Newport High School", ecoDis: "24%", meals: 6550, meqs: 5899, breakfast: "99%", lunch: "95%", snack: "154%", supper: "118%", revenue: "$40,112.84", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.3%", enp: "$34,000.00" },
  { school: "Orchard Grove Middle School", ecoDis: "16%", meals: 3120, meqs: 2778, breakfast: "88%", lunch: "84%", snack: "129%", supper: "109%", revenue: "$18,995.71", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.4%", enp: "$16,200.00" },
  { school: "Parkview Elementary School", ecoDis: "7%", meals: 1199, meqs: 1045, breakfast: "75%", lunch: "81%", snack: "96%", supper: "84%", revenue: "$6,954.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.1%", enp: "$5,800.00" },
  { school: "Quail Ridge High School", ecoDis: "20%", meals: 5888, meqs: 5330, breakfast: "91%", lunch: "94%", snack: "145%", supper: "111%", revenue: "$35,667.20", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.2%", enp: "$30,100.00" },
  { school: "Redwood Elementary School", ecoDis: "11%", meals: 1460, meqs: 1277, breakfast: "84%", lunch: "87%", snack: "103%", supper: "92%", revenue: "$8,721.64", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.6%", enp: "$7,300.00" },
  { school: "Stonebridge Middle School", ecoDis: "15%", meals: 2875, meqs: 2550, breakfast: "86%", lunch: "83%", snack: "122%", supper: "104%", revenue: "$17,245.19", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.9%", enp: "$14,900.00" },
  { school: "Timberlake High School", ecoDis: "26%", meals: 7011, meqs: 6390, breakfast: "103%", lunch: "97%", snack: "160%", supper: "124%", revenue: "$43,885.55", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.0%", enp: "$37,100.00" },
  { school: "University Heights Elementary School", ecoDis: "5%", meals: 1105, meqs: 955, breakfast: "71%", lunch: "77%", snack: "92%", supper: "80%", revenue: "$6,112.73", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.8%", enp: "$5,100.00" },
  { school: "Valley Creek Middle School", ecoDis: "18%", meals: 3422, meqs: 3010, breakfast: "90%", lunch: "89%", snack: "136%", supper: "113%", revenue: "$20,889.61", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.0%", enp: "$17,700.00" },

  { school: "Westfield High School", ecoDis: "23%", meals: 6120, meqs: 5511, breakfast: "97%", lunch: "93%", snack: "149%", supper: "116%", revenue: "$37,421.90", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.8%", enp: "$31,800.00" },
  { school: "Yorkshire Elementary School", ecoDis: "8%", meals: 1288, meqs: 1122, breakfast: "79%", lunch: "85%", snack: "98%", supper: "87%", revenue: "$7,488.45", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.7%", enp: "$6,400.00" },
  { school: "Zephyr Middle School", ecoDis: "14%", meals: 2655, meqs: 2340, breakfast: "83%", lunch: "82%", snack: "120%", supper: "101%", revenue: "$15,887.30", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.3%", enp: "$13,500.00" },
  { school: "Aspen Grove Elementary School", ecoDis: "10%", meals: 1520, meqs: 1310, breakfast: "85%", lunch: "88%", snack: "107%", supper: "94%", revenue: "$9,012.57", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.1%", enp: "$7,700.00" },
  { school: "Brookstone High School", ecoDis: "29%", meals: 7322, meqs: 6644, breakfast: "106%", lunch: "101%", snack: "165%", supper: "128%", revenue: "$45,998.16", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.4%", enp: "$38,900.00" },
  { school: "Clearwater Elementary School", ecoDis: "6%", meals: 1177, meqs: 1020, breakfast: "73%", lunch: "79%", snack: "95%", supper: "83%", revenue: "$6,745.91", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.9%", enp: "$5,600.00" },
  { school: "Driftwood Middle School", ecoDis: "17%", meals: 2988, meqs: 2666, breakfast: "87%", lunch: "85%", snack: "127%", supper: "106%", revenue: "$18,201.42", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.2%", enp: "$15,400.00" },
  { school: "Evergreen High School", ecoDis: "22%", meals: 6201, meqs: 5590, breakfast: "98%", lunch: "96%", snack: "152%", supper: "119%", revenue: "$38,554.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.0%", enp: "$32,600.00" },
  { school: "Fairview Elementary School", ecoDis: "9%", meals: 1366, meqs: 1199, breakfast: "81%", lunch: "84%", snack: "100%", supper: "89%", revenue: "$8,004.18", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.2%", enp: "$6,800.00" },
  { school: "Greenwood Middle School", ecoDis: "13%", meals: 2755, meqs: 2440, breakfast: "84%", lunch: "86%", snack: "123%", supper: "102%", revenue: "$16,778.03", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.5%", enp: "$14,200.00" },

    { school: "Hillside Elementary School", ecoDis: "8%", meals: 1244, meqs: 1080, breakfast: "78%", lunch: "83%", snack: "99%", supper: "86%", revenue: "$7,244.92", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.6%", enp: "$6,200.00" },
  { school: "Independence High School", ecoDis: "31%", meals: 7488, meqs: 6799, breakfast: "108%", lunch: "102%", snack: "168%", supper: "131%", revenue: "$47,810.15", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.8%", enp: "$40,200.00" },
  { school: "Jefferson Middle School", ecoDis: "19%", meals: 3250, meqs: 2880, breakfast: "89%", lunch: "87%", snack: "132%", supper: "110%", revenue: "$19,955.33", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.8%", enp: "$16,900.00" },
  { school: "Kennedy Elementary School", ecoDis: "10%", meals: 1411, meqs: 1220, breakfast: "84%", lunch: "86%", snack: "103%", supper: "91%", revenue: "$8,299.11", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.7%", enp: "$7,000.00" },
  { school: "Lincoln High School", ecoDis: "27%", meals: 6899, meqs: 6200, breakfast: "101%", lunch: "99%", snack: "157%", supper: "122%", revenue: "$42,998.67", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.6%", enp: "$36,200.00" },
  { school: "Madison Elementary School", ecoDis: "6%", meals: 1188, meqs: 1011, breakfast: "72%", lunch: "78%", snack: "94%", supper: "82%", revenue: "$6,811.24", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.7%", enp: "$5,700.00" },
  { school: "Norwood Middle School", ecoDis: "15%", meals: 2980, meqs: 2644, breakfast: "86%", lunch: "85%", snack: "125%", supper: "105%", revenue: "$18,100.55", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.1%", enp: "$15,300.00" },
  { school: "Oakridge High School", ecoDis: "24%", meals: 6112, meqs: 5500, breakfast: "97%", lunch: "94%", snack: "150%", supper: "117%", revenue: "$37,855.42", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.7%", enp: "$32,000.00" },
  { school: "Prairie View Elementary School", ecoDis: "9%", meals: 1333, meqs: 1150, breakfast: "80%", lunch: "84%", snack: "100%", supper: "88%", revenue: "$7,855.91", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.1%", enp: "$6,600.00" },
  { school: "Riverside Middle School", ecoDis: "18%", meals: 3444, meqs: 3050, breakfast: "91%", lunch: "88%", snack: "137%", supper: "112%", revenue: "$21,044.39", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.2%", enp: "$17,800.00" },

  { school: "Springfield High School", ecoDis: "29%", meals: 7200, meqs: 6550, breakfast: "105%", lunch: "100%", snack: "163%", supper: "126%", revenue: "$45,221.10", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.2%", enp: "$38,100.00" },
  { school: "Trinity Elementary School", ecoDis: "7%", meals: 1210, meqs: 1044, breakfast: "76%", lunch: "81%", snack: "97%", supper: "85%", revenue: "$7,055.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.3%", enp: "$5,900.00" },
  { school: "Union Middle School", ecoDis: "16%", meals: 2877, meqs: 2520, breakfast: "85%", lunch: "84%", snack: "124%", supper: "104%", revenue: "$17,522.04", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.8%", enp: "$14,800.00" },
  { school: "Victory High School", ecoDis: "26%", meals: 6777, meqs: 6100, breakfast: "100%", lunch: "98%", snack: "156%", supper: "120%", revenue: "$41,875.29", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.4%", enp: "$35,400.00" },
  { school: "Washington Elementary School", ecoDis: "11%", meals: 1488, meqs: 1299, breakfast: "85%", lunch: "89%", snack: "105%", supper: "93%", revenue: "$8,921.67", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "10.0%", enp: "$7,500.00" },
  { school: "Xavier Middle School", ecoDis: "14%", meals: 2660, meqs: 2355, breakfast: "82%", lunch: "83%", snack: "121%", supper: "100%", revenue: "$16,011.52", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.1%", enp: "$13,600.00" },
  { school: "Yellowstone High School", ecoDis: "22%", meals: 5988, meqs: 5400, breakfast: "95%", lunch: "93%", snack: "147%", supper: "114%", revenue: "$36,500.88", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.3%", enp: "$30,800.00" },
  { school: "Zion Elementary School", ecoDis: "5%", meals: 1110, meqs: 950, breakfast: "70%", lunch: "76%", snack: "91%", supper: "79%", revenue: "$6,001.14", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.5%", enp: "$5,000.00" },
  { school: "Adams Middle School", ecoDis: "17%", meals: 3099, meqs: 2755, breakfast: "88%", lunch: "86%", snack: "130%", supper: "108%", revenue: "$18,877.44", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.6%", enp: "$16,000.00" },
  { school: "Briarwood High School", ecoDis: "28%", meals: 7055, meqs: 6400, breakfast: "104%", lunch: "99%", snack: "161%", supper: "125%", revenue: "$44,201.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.1%", enp: "$37,500.00" },

  { school: "Crestview Elementary School", ecoDis: "8%", meals: 1277, meqs: 1105, breakfast: "77%", lunch: "82%", snack: "98%", supper: "86%", revenue: "$7,410.28", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.4%", enp: "$6,100.00" },
  { school: "Douglas Middle School", ecoDis: "15%", meals: 2944, meqs: 2600, breakfast: "85%", lunch: "84%", snack: "123%", supper: "103%", revenue: "$17,944.80", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.9%", enp: "$15,100.00" },
  { school: "Eastview High School", ecoDis: "25%", meals: 6333, meqs: 5711, breakfast: "98%", lunch: "95%", snack: "153%", supper: "118%", revenue: "$39,255.62", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.0%", enp: "$33,100.00" },
  { school: "Franklin Elementary School", ecoDis: "9%", meals: 1390, meqs: 1210, breakfast: "81%", lunch: "85%", snack: "101%", supper: "89%", revenue: "$8,144.55", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.3%", enp: "$6,900.00" },
  { school: "Grant Middle School", ecoDis: "18%", meals: 3330, meqs: 2950, breakfast: "90%", lunch: "87%", snack: "135%", supper: "111%", revenue: "$20,344.19", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.0%", enp: "$17,200.00" },
  { school: "Hamilton High School", ecoDis: "30%", meals: 7444, meqs: 6755, breakfast: "107%", lunch: "101%", snack: "166%", supper: "129%", revenue: "$46,788.90", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "16.6%", enp: "$39,600.00" },
  { school: "Irving Elementary School", ecoDis: "6%", meals: 1166, meqs: 1000, breakfast: "73%", lunch: "79%", snack: "95%", supper: "83%", revenue: "$6,655.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "7.8%", enp: "$5,500.00" },
  { school: "Jackson Middle School", ecoDis: "16%", meals: 3011, meqs: 2677, breakfast: "87%", lunch: "85%", snack: "126%", supper: "106%", revenue: "$18,411.36", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.3%", enp: "$15,600.00" },
  { school: "Kingston High School", ecoDis: "23%", meals: 6105, meqs: 5522, breakfast: "96%", lunch: "94%", snack: "148%", supper: "115%", revenue: "$37,622.58", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.5%", enp: "$31,900.00" },
  { school: "Lakeshore Elementary School", ecoDis: "10%", meals: 1444, meqs: 1250, breakfast: "83%", lunch: "87%", snack: "104%", supper: "92%", revenue: "$8,688.03", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.9%", enp: "$7,200.00" },

  { school: "Monroe Middle School", ecoDis: "17%", meals: 3155, meqs: 2801, breakfast: "88%", lunch: "86%", snack: "131%", supper: "109%", revenue: "$19,244.90", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "12.7%", enp: "$16,300.00" },
  { school: "Northbrook High School", ecoDis: "26%", meals: 6670, meqs: 6033, breakfast: "100%", lunch: "97%", snack: "155%", supper: "121%", revenue: "$41,102.77", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "15.5%", enp: "$34,800.00" },
  { school: "Oakdale Elementary School", ecoDis: "7%", meals: 1222, meqs: 1060, breakfast: "75%", lunch: "80%", snack: "97%", supper: "84%", revenue: "$7,122.18", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.2%", enp: "$5,900.00" },
  { school: "Parkside Middle School", ecoDis: "14%", meals: 2766, meqs: 2444, breakfast: "84%", lunch: "83%", snack: "122%", supper: "102%", revenue: "$16,755.66", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.4%", enp: "$14,100.00" },
  { school: "Queensridge High School", ecoDis: "21%", meals: 5899, meqs: 5310, breakfast: "94%", lunch: "92%", snack: "146%", supper: "113%", revenue: "$36,011.40", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.1%", enp: "$30,400.00" },
  { school: "Roosevelt Elementary School", ecoDis: "9%", meals: 1355, meqs: 1188, breakfast: "80%", lunch: "84%", snack: "100%", supper: "88%", revenue: "$7,944.87", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "9.0%", enp: "$6,700.00" },
  { school: "Sycamore Middle School", ecoDis: "15%", meals: 2899, meqs: 2570, breakfast: "86%", lunch: "84%", snack: "124%", supper: "104%", revenue: "$17,655.72", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "11.8%", enp: "$14,900.00" },
  { school: "Twin Oaks High School", ecoDis: "24%", meals: 6222, meqs: 5633, breakfast: "97%", lunch: "95%", snack: "150%", supper: "116%", revenue: "$38,244.61", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "14.6%", enp: "$32,200.00" },
  { school: "Upland Elementary School", ecoDis: "8%", meals: 1266, meqs: 1099, breakfast: "77%", lunch: "82%", snack: "98%", supper: "86%", revenue: "$7,355.49", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "8.5%", enp: "$6,100.00" },
  { school: "Westlake Middle School", ecoDis: "18%", meals: 3388, meqs: 3001, breakfast: "90%", lunch: "88%", snack: "136%", supper: "111%", revenue: "$20,788.14", waste: "$0.00", inventoryValue: "$0.00", inventoryTurnover: "0 (365 days)", physicalInventoryDiscrepancy: "$0.00", mplh: "0.00", pna: "13.1%", enp: "$17,600.00" },
];

const SortIcon = ({ column, config }: { column: string, config: any }) => {
  if (config?.key !== column) return <div className="w-4 h-4 opacity-0" />;
  return config.direction === 'asc' 
    ? <ChevronUpIcon className="w-4 h-4 text-blue-600" /> 
    : <ChevronDownIcon className="w-4 h-4 text-blue-600" />;
};

interface SchoolPerformanceGridProps {
  onSchoolieClick?: () => void;
  onOpenSingleSchool?: (schoolName: string, metric: 'MPLH' | 'PNA' | 'ENP') => void;
}

export const SchoolPerformanceGrid: React.FC<SchoolPerformanceGridProps> = ({ onSchoolieClick, onOpenSingleSchool }) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState<number | 'All'>(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof SchoolPerformanceData; direction: 'asc' | 'desc' } | null>({
    key: 'school',
    direction: 'asc',
  });

  const filteredData = useMemo(() => {
    return PERFORMANCE_DATA.filter(item => 
      item.school.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const sortedData = useMemo(() => {
    const sortableItems = [...filteredData];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);

  const itemsPerPage = rowsPerPage === 'All' ? sortedData.length : rowsPerPage;
  const totalPages = Math.ceil(sortedData.length / (itemsPerPage || 1));
  const startIndex = (currentPage - 1) * (itemsPerPage as number);
  const currentRows = sortedData.slice(startIndex, startIndex + (itemsPerPage as number));

  const handleSort = (key: keyof SchoolPerformanceData) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig?.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // Function to copy grid data to clipboard in a tabular format
  const copyGridToClipboard = async () => {
    const headers = [
      'School',
      'Eco Dis',
      'Meals',
      'MEQs',
      'Breakfast',
      'Lunch',
      'Snack',
      'Supper',
      'Revenue',
      'Waste',
      'Inventory Value',
      'Inventory Turnover',
      'Physical Inventory Discrepancy',
      'MPLH',
      'PNA',
      'ENP',
    ];

    const rows = sortedData.map((row) => [
      row.school,
      row.ecoDis,
      row.meals.toLocaleString(),
      row.meqs.toLocaleString(),
      row.breakfast,
      row.lunch,
      row.snack,
      row.supper,
      row.revenue,
      row.waste,
      row.inventoryValue,
      row.inventoryTurnover,
      row.physicalInventoryDiscrepancy,
      row.mplh,
      row.pna,
      row.enp,
    ]);

    const text = [headers, ...rows]
      .map((row) => row.join('\t'))
      .join('\n');

    await navigator.clipboard.writeText(text);
  };

const copyGridImageToClipboard = async () => {
  if (!gridRef.current) return;

  const node = gridRef.current;
  const width = node.scrollWidth;
  const height = node.scrollHeight;
  const pixelRatio = height > 4000 ? 1 : 2;

  const blob = await toBlob(node, {
    backgroundColor: '#ffffff',

    // Important: use 1 for very tall tables
    pixelRatio: pixelRatio,

    width,
    height,
    style: {
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: 'none',
      maxHeight: 'none',
      overflow: 'visible',
    },
  });

  if (!blob) return;

  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
};

  const TableHeader = ({ label, sortKey, align = "center" }: { label: string, sortKey?: keyof SchoolPerformanceData, align?: "left" | "center" | "right" }) => (
    <th 
      onClick={() => sortKey && handleSort(sortKey)} 
      className={`px-3 py-3 text-${align} text-[10px] font-semibold text-gray-500 uppercase tracking-wider ${sortKey ? 'cursor-pointer hover:bg-gray-100' : ''}`}
    >
      <div className={`flex items-center ${align === 'center' ? 'justify-center' : ''} gap-1`}>
        <span>{label}</span>
        {sortKey && <SortIcon column={sortKey} config={sortConfig} />}
      </div>
    </th>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
      <div className="p-4 border-b border-gray-100 flex justify-between items-end bg-white">
        <div className="flex items-baseline gap-3">
            <h3 className="text-lg font-bold text-gray-800">School Performance</h3>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider"> - Showing results for: Current Month </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy Button Section */}
          <CopyMenu onCopyData={copyGridToClipboard} onCopyImage={copyGridImageToClipboard} disableImageCopy={rowsPerPage === 'All'} />

          {/* Schoolie Button Section */}
          {onSchoolieClick && (
            <button
              onClick={onSchoolieClick}
              title="Ask Schoolie"
              className="flex items-center justify-center w-[40px] h-[40px] bg-white rounded-lg hover:shadow-sm transition-all group border-none"
            >
              <SchoolieIcon size={24} className="text-gray-500 group-hover:text-indigo-600 transition-colors"
              />
            </button>
          )}
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search school..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <div ref={gridRef} className="bg-white inline-block">
  <div className="overflow-x-visible">
        <table className="min-w-max divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <TableHeader label="School" sortKey="school" align="left" />
              <TableHeader label="Eco Dis" sortKey="ecoDis" />
              <TableHeader label="Meals" sortKey="meals" />
              <TableHeader label="Meqs" sortKey="meqs" />
              <TableHeader label="Breakfast" sortKey="breakfast" />
              <TableHeader label="Lunch" sortKey="lunch" />
              <TableHeader label="Snack" sortKey="snack" />
              <TableHeader label="Supper" sortKey="supper" />
              <TableHeader label="Revenue" sortKey="revenue" />
              <TableHeader label="Waste" sortKey="waste" />
              <TableHeader label="Inventory Value" sortKey="inventoryValue" />
              <TableHeader label="Inventory Turnover" sortKey="inventoryTurnover" />
              <TableHeader label="Phys Inventory Discrepancy" sortKey="physicalInventoryDiscrepancy" />
              <TableHeader label="MPLH" sortKey="mplh" />
              <TableHeader label="PNA" sortKey="pna" />
              <TableHeader label="ENP" sortKey="enp" />
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {currentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-3 py-4 text-xs font-semibold text-gray-900 whitespace-nowrap">{row.school}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.ecoDis}</td>
                <td className={`px-3 py-4 text-xs text-center font-medium ${row.meals > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{row.meals.toLocaleString()}</td>
                <td className={`px-3 py-4 text-xs text-center font-medium ${row.meqs > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{row.meqs.toLocaleString()}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.breakfast}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.lunch}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.snack}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.supper}</td>
                <td className="px-3 py-4 text-xs text-center text-red-500 font-medium">{row.revenue}</td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">{row.waste}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.inventoryValue}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.inventoryTurnover}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500">{row.physicalInventoryDiscrepancy}</td>
                <td className="px-3 py-4 text-xs text-center text-gray-500 font-medium">
                  {onOpenSingleSchool ? (
                    <button onClick={() => onOpenSingleSchool(row.school, 'MPLH')} className="hover:underline hover:text-blue-600 cursor-pointer transition-colors">{row.mplh}</button>
                  ) : row.mplh}
                </td>
                <td className="px-3 py-4 text-xs text-center text-emerald-500 font-medium">
                  {onOpenSingleSchool ? (
                    <button onClick={() => onOpenSingleSchool(row.school, 'PNA')} className="hover:underline hover:text-blue-600 cursor-pointer transition-colors">{row.pna}</button>
                  ) : row.pna}
                </td>
                <td className="px-3 py-4 text-xs text-center text-gray-500 font-medium">
                  {onOpenSingleSchool ? (
                    <button onClick={() => onOpenSingleSchool(row.school, 'ENP')} className="hover:underline hover:text-blue-600 cursor-pointer transition-colors">{row.enp}</button>
                  ) : row.enp}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-white border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Showing {startIndex + 1}-{Math.min(startIndex + (itemsPerPage as number), sortedData.length)} of {sortedData.length}</span>
          <select 
            className="border border-gray-200 rounded px-1 py-0.5 bg-white" 
            value={rowsPerPage} 
            onChange={(e) => {
              setRowsPerPage(e.target.value === 'All' ? 'All' : parseInt(e.target.value));
              setCurrentPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value="All">All</option>
          </select>
        </div>
        
        {rowsPerPage !== 'All' && totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1} 
              className="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronLeftIcon className="w-4 h-4 text-gray-600"/>
            </button>
            <span className="text-xs text-gray-600 font-medium">Page {currentPage} of {totalPages}</span>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages} 
              className="p-1 border border-gray-200 rounded disabled:opacity-30 hover:bg-gray-50"
            >
              <ChevronRightIcon className="w-4 h-4 text-gray-600"/>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};