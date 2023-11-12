import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(updateLocale);
dayjs.extend(relativeTime);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
  },
});

export const formatTimeDiff = (time: string) => {
  const timeThen = dayjs(time);
  const now = dayjs();

  const diff = now.diff(time, 'minutes');

  if (diff <= 60 * 20) {
    return timeThen.fromNow(true);
  }

  if (diff < 60 * 24) {
    return Math.round(diff / 60) + 'h';
  }

  if (diff < 60 * 24 * 30) {
    return timeThen.format('MMM D');
  }

  return timeThen.format('MMM D, YYYY');
};

export const formatTime = (time: string, withTime: boolean = false) => {
  const timeThen = dayjs(time);
  const now = dayjs();

  const diff = now.diff(time, 'minutes');

  if (diff < 60 * 24) {
    return timeThen.format('hh:mm A');
  }

  if (diff < 60 * 24 * 2) {
    return withTime ? 'Yesterday, ' + timeThen.format('hh:mm A') : 'Yesterday';
  }

  if (diff < 60 * 24 * 7) {
    return withTime ? timeThen.format('dddd, hh:mm A') : timeThen.format('dddd');
  }

  if (diff < 60 * 24 * 365) {
    return withTime ? timeThen.format('MMM D, hh:mm A') : timeThen.format('MMM D');
  }

  return withTime ? timeThen.format('MMM D, YYYY, hh:mm A') : timeThen.format('MMM D, YYYY');
};
