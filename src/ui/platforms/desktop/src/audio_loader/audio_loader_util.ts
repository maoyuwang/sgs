import { ClientFlavor } from 'props/config_props';
import { ProdAudioLoader } from './prod_audio_loader';

export function getAudioLoader(flavor: ClientFlavor) {
  // switch (flavor) {
  //   case ClientFlavor.Web:
  //     return new DevAudioLoader();
  //   case ClientFlavor.Dev:
  //   case ClientFlavor.Desktop:
  //   case ClientFlavor.Mobile:
  //     return new ProdAudioLoader();
  //   default:
  //     throw Precondition.UnreachableError(flavor);
  // }
  return new ProdAudioLoader();
}
