import { WebHaptics } from 'web-haptics';

let instance: WebHaptics | null = null;

function getHaptics(): WebHaptics | null {
  if (typeof window === 'undefined') return null;
  if (!WebHaptics.isSupported) return null;
  if (!instance) instance = new WebHaptics();
  return instance;
}

export function hapticSelection() {
  getHaptics()?.trigger('selection');
}

export function hapticLight() {
  getHaptics()?.trigger('light');
}

export function hapticMedium() {
  getHaptics()?.trigger('medium');
}

export function hapticSoft() {
  getHaptics()?.trigger('soft');
}

export function hapticRigid() {
  getHaptics()?.trigger('rigid');
}

export function hapticWarning() {
  getHaptics()?.trigger('warning');
}

export function hapticSuccess() {
  getHaptics()?.trigger('success');
}

export function hapticNudge() {
  getHaptics()?.trigger('nudge');
}
