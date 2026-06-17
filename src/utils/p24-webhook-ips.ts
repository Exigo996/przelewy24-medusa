export const P24_WEBHOOK_ALLOWED_IPS = [
  "5.252.202.254",
  "5.252.202.255",
  "20.215.81.124",
] as const;

export const P24_WEBHOOK_ALLOWED_CIDRS = [
  "193.178.213.0/24",
  "91.220.177.0/24",
  "20.215.183.48/28",
  "134.112.88.8/29",
] as const;

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) {
    return null;
  }

  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) {
      return null;
    }
    const octet = Number(part);
    if (!Number.isInteger(octet) || octet < 0 || octet > 255) {
      return null;
    }
    value = (value << 8) + octet;
  }

  return value >>> 0;
}

function isIpv4InCidr(ip: string, cidr: string): boolean {
  const [network, prefixStr] = cidr.split("/");
  const prefix = Number(prefixStr);

  if (!network || !Number.isInteger(prefix) || prefix < 0 || prefix > 32) {
    return false;
  }

  const ipNum = ipv4ToNumber(ip);
  const networkNum = ipv4ToNumber(network);

  if (ipNum === null || networkNum === null) {
    return false;
  }

  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (ipNum & mask) === (networkNum & mask);
}

export function isAllowedP24WebhookSourceIp(
  ipAddress: string | undefined,
  options: { sandbox?: boolean } = {},
): boolean {
  const normalized = ipAddress?.trim();
  if (!normalized) {
    return false;
  }

  if (
    options.sandbox &&
    (normalized === "127.0.0.1" || normalized === "::1")
  ) {
    return true;
  }

  if (
    P24_WEBHOOK_ALLOWED_IPS.includes(
      normalized as (typeof P24_WEBHOOK_ALLOWED_IPS)[number],
    )
  ) {
    return true;
  }

  return P24_WEBHOOK_ALLOWED_CIDRS.some((cidr) =>
    isIpv4InCidr(normalized, cidr),
  );
}
