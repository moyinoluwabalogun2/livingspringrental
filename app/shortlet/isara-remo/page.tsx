import {
  permanentRedirect,
} from 'next/navigation';

export default function IsaraRemoShortLetPage() {
  permanentRedirect(
    '/shortlet?keyword=Isara-Remo'
  );
}