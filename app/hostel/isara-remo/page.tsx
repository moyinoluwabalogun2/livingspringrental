import {
  permanentRedirect,
} from 'next/navigation';

export default function IsaraRemoHostelPage() {
  permanentRedirect(
    '/hostel?keyword=Isara-Remo'
  );
}