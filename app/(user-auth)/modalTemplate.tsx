import { styled } from 'styled-components/native'

type ModalTemplateProps = {
    children?: React.ReactNode
}

const ModalTemplate = ({ children }: ModalTemplateProps) => {
    return (
        <Modal>
            <ModalContent>
                {children}
            </ModalContent>
        </Modal>
    )
}

export default ModalTemplate

const Modal = styled.View`
    padding-vertical: 28px;
    padding-horizontal: 24px;
    background-color: #FAFAFA;
    flex: 1;
`
const TopBar = styled.View`
    flex-direction: row;
    justify-content: flex-start;
    margin-bottom: 40px;
`
const ModalContent = styled.ScrollView`
    flex-direction: column;
`