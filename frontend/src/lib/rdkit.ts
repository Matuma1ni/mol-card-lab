interface RDKitMolecule {
  get_svg(): string
  delete(): void
}

interface RDKitModule {
  get_mol(smiles: string): RDKitMolecule | null
}

type InitRDKitModule = (options: {
  locateFile: (file: string) => string
}) => Promise<RDKitModule>

declare global {
  interface ImportMeta {
    readonly env: {
      readonly BASE_URL: string
    }
  }

  interface Window {
    initRDKitModule?: InitRDKitModule
  }
}

export type RenderSmilesResult =
  | { status: 'success'; svg: string }
  | { status: 'invalid' }

const assetUrl = (file: string) => `${import.meta.env.BASE_URL}rdkit/${file}`

let scriptPromise: Promise<InitRDKitModule> | undefined
let modulePromise: Promise<RDKitModule> | undefined
let scriptElement: HTMLScriptElement | undefined

function loadInitializer(): Promise<InitRDKitModule> {
  if (scriptPromise) return scriptPromise

  scriptPromise = new Promise<InitRDKitModule>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = assetUrl('RDKit_minimal.js')
    script.async = true
    script.dataset.rdkitLoader = 'true'
    scriptElement = script

    script.addEventListener('load', () => {
      if (window.initRDKitModule) {
        resolve(window.initRDKitModule)
        return
      }
      reject(new Error('RDKit initializer was not defined'))
    })
    script.addEventListener('error', () => {
      reject(new Error('RDKit script failed to load'))
    })
    document.head.append(script)
  }).catch((error: unknown) => {
    scriptElement?.remove()
    scriptElement = undefined
    scriptPromise = undefined
    modulePromise = undefined
    throw error
  })

  return scriptPromise
}

export function loadRDKit(): Promise<RDKitModule> {
  if (modulePromise) return modulePromise

  modulePromise = loadInitializer()
    .then((initialize) =>
      initialize({
        locateFile: (file) =>
          file.endsWith('.wasm') ? assetUrl('RDKit_minimal.wasm') : assetUrl(file),
      }),
    )
    .catch((error: unknown) => {
      scriptElement?.remove()
      scriptElement = undefined
      scriptPromise = undefined
      modulePromise = undefined
      delete window.initRDKitModule
      throw error
    })

  return modulePromise
}

export async function renderSmilesToSvg(smiles: string): Promise<RenderSmilesResult> {
  const rdkit = await loadRDKit()
  let molecule: RDKitMolecule | null
  try {
    molecule = rdkit.get_mol(smiles)
  } catch {
    return { status: 'invalid' }
  }
  if (!molecule) return { status: 'invalid' }

  try {
    return { status: 'success', svg: molecule.get_svg() }
  } finally {
    molecule.delete()
  }
}

export function resetRDKitForTests(): void {
  scriptElement?.remove()
  scriptElement = undefined
  scriptPromise = undefined
  modulePromise = undefined
  delete window.initRDKitModule
}
