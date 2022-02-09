import {
  pickFlavor, mergeFlavor, useFlavor,
  SECRET_PREFIX, useSecret
} from 'source/common/config/Object.js'

/** @deprecated */ const pickFlavorExport = pickFlavor // TODO: DEPRECATE
/** @deprecated */ const mergeFlavorExport = mergeFlavor // TODO: DEPRECATE
/** @deprecated */ const useFlavorExport = useFlavor // TODO: DEPRECATE
/** @deprecated */ const SECRET_PREFIX_EXPORT = SECRET_PREFIX // TODO: DEPRECATE
/** @deprecated */ const useSecretExport = useSecret // TODO: DEPRECATE

export {
  pickFlavorExport as pickFlavor,
  mergeFlavorExport as mergeFlavor,
  useFlavorExport as useFlavor,
  SECRET_PREFIX_EXPORT as SECRET_PREFIX,
  useSecretExport as useSecret
}
