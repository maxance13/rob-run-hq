export type Scenario = {
  item: string; extra: string; quantity: string; value: string; cash: string; costs: string;
  key: string; minutes: string; players: string; chance: string; failure: string;
};
export const blank: Scenario = {item:"",extra:"",quantity:"0",value:"",cash:"",costs:"",key:"",minutes:"",players:"1",chance:"",failure:""};
export const example: Scenario = {...blank,cash:"120000",costs:"30000",key:"0",minutes:"25",players:"2",chance:"75",failure:"-30000"};
export const scenarioKeys = Object.keys(blank) as (keyof Scenario)[];
const parse = (input: string) => /^-?(?:\d+\.?\d*|\.\d+)$/.test(input.trim()) ? Number(input) : null;
export type LootLine = {quantity:string;value:string};
export const maxLines = 8;
export function readLootLines(input: string): LootLine[] | null {
  if (!input) return [];
  try {
    const data: unknown = JSON.parse(input);
    if (Array.isArray(data) && data.length <= maxLines && data.every(row => row && typeof row.quantity === "string" && typeof row.value === "string" && row.quantity.length <= 24 && row.value.length <= 24)) return data;
  } catch { /* Invalid shared scenario. */ }
  return null;
}
export function profit(s: Scenario) {
  const qty = parse(s.quantity), value = parse(s.value), cash = parse(s.cash), costs = parse(s.costs), key = parse(s.key), mins = parse(s.minutes), players = parse(s.players), chance = parse(s.chance), loss = parse(s.failure);
  const valid = (n: number | null): n is number => n !== null && n >= 0 && n <= 1e12;
  const extra = readLootLines(s.extra)?.map(row => [parse(row.quantity),parse(row.value)]);
  const extraTotal = extra?.reduce<number | null>((sum,[count,price]) => {
    if (sum === null || !valid(count) || !Number.isInteger(count) || (count > 0 && !valid(price))) return null;
    return sum + count*(price ?? 0);
  },0);
  const gross = valid(cash) && valid(qty) && Number.isInteger(qty) && (qty === 0 || valid(value)) && typeof extraTotal === "number" ? cash + qty*(value ?? 0)+extraTotal : null;
  const expenses = valid(costs) && valid(key) ? costs + key : null;
  const net = gross !== null && expenses !== null ? gross-expenses : null;
  const hourly = net !== null && valid(mins) && mins > 0 && Number.isFinite(net*60/mins) ? net*60/mins : null;
  const player = net !== null && valid(players) && players >= 1 && Number.isInteger(players) ? net/players : null;
  const expected = net !== null && valid(chance) && chance <= 100 && loss !== null && Math.abs(loss) <= 1e12 ? net*(chance/100)+loss*(1-chance/100) : null;
  return {gross, expenses, net, hourly, player, expected};
}
export function atLeastOne(pct: string, trials: string) {
  const p=parse(pct), n=parse(trials);
  return p !== null && p>=0 && p<=100 && n !== null && Number.isSafeInteger(n) && n>0 ? -Math.expm1(n*Math.log1p(-p/100))*100 : null;
}
export function wilson(x: number,n: number) {
  if (!n) return null;
  const p=x/n, z=1.95996398454, denominator=1+z*z/n;
  const center=(p+z*z/(2*n))/denominator;
  const span=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/denominator;
  return [Math.max(0,(center-span)*100),Math.min(100,(center+span)*100)];
}
