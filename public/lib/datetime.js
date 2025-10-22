// 날짜 포맷 유틸: 2024.06.14 00:00:00
function pad2(n) { return String(n).padStart(2, '0'); }

function fromYMDHMSLocal(y, m, d, hh, mm, ss) {
  // 월은 0-indexed
  return new Date(y, m - 1, d, hh, mm, ss || 0);
}

function parseDateSafe(value) {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (typeof value === 'number') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }
  if (typeof value === 'string') {
    // 패턴: YYYY-MM-DD HH:mm:ss
    const m = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?/);
    if (m) {
      const [_, y, mo, d, hh, mm, ss] = m;
      return fromYMDHMSLocal(+y, +mo, +d, +hh, +mm, ss ? +ss : 0);
    }
    // 그 외는 브라우저 파서에 위임
    const d2 = new Date(value);
    return isNaN(d2.getTime()) ? null : d2;
  }
  return null;
}

export function formatDateTime(value) {
  const d = parseDateSafe(value);
  if (!d) return '';
  const yyyy = d.getFullYear();
  const MM = pad2(d.getMonth() + 1);
  const DD = pad2(d.getDate());
  const hh = pad2(d.getHours());
  const mm = pad2(d.getMinutes());
  const ss = pad2(d.getSeconds());
  return `${yyyy}.${MM}.${DD} ${hh}:${mm}:${ss}`;
}
