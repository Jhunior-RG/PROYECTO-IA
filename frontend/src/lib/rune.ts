import * as backend from "face-api.js";

const Rune = {
    core: {
        loadBaseModel: async (path: string) =>
            await backend.nets.ssdMobilenetv1.loadFromUri(path),

        loadKeypointModel: async (path: string) =>
            await backend.nets.faceLandmark68Net.loadFromUri(path),

        loadEmbeddingModel: async (path: string) =>
            await backend.nets.faceRecognitionNet.loadFromUri(path),
    },

    io: {
        resizeCanvasTo: backend.matchDimensions,
        scaleOutputs: backend.resizeResults,
        fetchImageFrom: backend.fetchImage,
    },
    loadModel: async (url:string) => {
        await Promise.all([
            Rune.core.loadBaseModel(url),
            Rune.core.loadKeypointModel(url),
            Rune.core.loadEmbeddingModel(url),
        ]);
    },
    pipeline: {
        processAll: async (input: HTMLImageElement | HTMLVideoElement) => {
            return await backend
                .detectAllFaces(input)
                .withFaceLandmarks()
                .withFaceDescriptors();
        },

        processSingle: async (input: HTMLImageElement) => {
            return await backend
                .detectSingleFace(input)
                .withFaceLandmarks()
                .withFaceDescriptor();
        },
    },

    types: {
        LabeledDescriptor: backend.LabeledFaceDescriptors,
        Matcher: backend.FaceMatcher,
    },
};

export default Rune;
