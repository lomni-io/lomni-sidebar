import {FramesData, NoteFrameData, WebFrameData} from "@/entity/frame";

export function mergeData(fromData:FramesData, toData: FramesData, isPull?: boolean){
    let finalRemoteData = JSON.parse(JSON.stringify(toData)) as FramesData
    const itemsAdded: FramesData=[]
    const itemsModified = new Array<any>()
    const itemsRemoved: FramesData=[]
    let hasChanges = false

    fromData.forEach(localFrame => {
        const isWebFrame = !!(<WebFrameData>localFrame).url
        const isNoteFrame = !!(<NoteFrameData>localFrame).content

        const remoteFrameIdx = toData.findIndex(frame => {
            return isWebFrame ? (<WebFrameData>frame).url === (<WebFrameData>localFrame).url : (<NoteFrameData>frame).id === (<NoteFrameData>localFrame).id
        })
        if (~remoteFrameIdx){

            if (localFrame.updatedAt > toData[remoteFrameIdx].updatedAt || (isPull && localFrame.updatedAt < toData[remoteFrameIdx].updatedAt)){
                hasChanges = true
                if (isWebFrame){
                    itemsModified.push(generateDiff((<WebFrameData>localFrame), <WebFrameData>finalRemoteData[remoteFrameIdx]))
                }
                if (isNoteFrame){
                    itemsModified.push(generateNoteFrameDiff((<NoteFrameData>localFrame), <NoteFrameData>finalRemoteData[remoteFrameIdx]))
                }
                finalRemoteData[remoteFrameIdx] = localFrame
            }
        }else{
            hasChanges = true
            itemsAdded.push(localFrame)
            finalRemoteData.push(localFrame)
        }
    })

    finalRemoteData = finalRemoteData.filter(remoteFrame => {
        const isWebFrame = !!(<WebFrameData>remoteFrame).url

        const localFrameIdx = fromData.findIndex(frame => {
            return isWebFrame ? (<WebFrameData>frame).url === (<WebFrameData>remoteFrame).url : (<NoteFrameData>frame).id === (<NoteFrameData>remoteFrame).id
        })

        if (localFrameIdx === -1){
            hasChanges = true
            itemsRemoved.push(remoteFrame)
            return false
        }
        return true
    })


    return {
        hasChanges:hasChanges,
        frames: finalRemoteData,
        itemsRemoved: itemsRemoved,
        itemsAdded: itemsAdded,
        itemsModified: itemsModified,
    }
}

export function generateDiff(fromFrame: WebFrameData, toFrame: WebFrameData){
    let newComment = null
    let oldComment = null
    if (fromFrame.comment !== toFrame.comment){
        oldComment = toFrame.comment ? toFrame.comment : ''
        newComment = fromFrame.comment ? fromFrame.comment : ''
    }

    let newTitle = null
    let oldTitle = null
    if (fromFrame.title !== toFrame.title){
        newTitle = fromFrame.title ? fromFrame.title : null
        oldTitle = toFrame.title ? toFrame.title : null
    }

    const tagsToAdd = fromFrame.tags ? fromFrame.tags.filter(tag => !(toFrame.tags && toFrame.tags.includes(tag))) : []
    const tagsToRemove = toFrame.tags ? toFrame.tags.filter(tag => !(fromFrame.tags && fromFrame.tags.includes(tag))) : []

    return {
        url: fromFrame.url,
        newComment: newComment,
        oldComment: oldComment,
        newTitle: newTitle,
        oldTitle: oldTitle,
        tagsToAdd: tagsToAdd,
        tagsToRemove: tagsToRemove
    }
}

export function generateNoteFrameDiff(fromFrame: NoteFrameData, toFrame: NoteFrameData){
    let newContent = null
    let oldContent = null
    if (fromFrame.content !== toFrame.content){
        oldContent = toFrame.content ? toFrame.content : ''
        newContent = fromFrame.content ? fromFrame.content : ''
    }

    const tagsToAdd = fromFrame.tags ? fromFrame.tags.filter(tag => !(toFrame.tags && toFrame.tags.includes(tag))) : []
    const tagsToRemove = toFrame.tags ? toFrame.tags.filter(tag => !(fromFrame.tags && fromFrame.tags.includes(tag))) : []

    return {
        oldContent: oldContent,
        newContent: newContent,
        tagsToAdd: tagsToAdd,
        tagsToRemove: tagsToRemove
    }
}