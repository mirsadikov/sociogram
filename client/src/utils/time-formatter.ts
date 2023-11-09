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

export const formatTime = (time: string) => {
  const timeThen = dayjs(time);
  const now = dayjs();

  if (now.diff(time, 'day') > 1) {
    return timeThen.format('MMM D, YYYY');
  }

  return timeThen.fromNow(true);
};
